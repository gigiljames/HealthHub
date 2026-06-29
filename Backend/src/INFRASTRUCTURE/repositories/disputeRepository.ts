import { Types, PipelineStage } from "mongoose";
import Dispute from "../../domain/entities/dispute";
import {
  IDisputeRepository,
  DisputeFilterParams,
  PaginatedDisputes,
  DisputeListItem,
} from "../../domain/interfaces/repositories/IDisputeRepository";
import { disputeModel, IDisputeDocument } from "../DB/models/disputeModel";
import { BaseRepository } from "./base/BaseRepository";
import { DisputeRepoMapper } from "./mappers/disputeRepoMapper";

export class DisputeRepository
  extends BaseRepository<IDisputeDocument>
  implements IDisputeRepository
{
  constructor() {
    super(disputeModel);
  }

  async findById(id: string): Promise<Dispute | null> {
    const doc = await this.findDocumentById(id);
    return doc ? DisputeRepoMapper.toEntityFromDocument(doc) : null;
  }

  async save(dispute: Dispute): Promise<Dispute> {
    if (dispute.id) {
      const doc = await disputeModel.findByIdAndUpdate(
        dispute.id,
        {
          status: dispute.status,
          resolutionMessage: dispute.resolutionMessage,
          resolvedBy: dispute.resolvedBy ? new Types.ObjectId(dispute.resolvedBy) : null,
          resolvedAt: dispute.resolvedAt,
          updatedAt: new Date(),
        },
        { new: true },
      );
      if (!doc) throw new Error("Dispute not found");
      return DisputeRepoMapper.toEntityFromDocument(doc);
    } else {
      const doc = await disputeModel.create({
        appointmentId: new Types.ObjectId(dispute.appointmentId),
        reporterId: new Types.ObjectId(dispute.reporterId),
        reportedUserId: new Types.ObjectId(dispute.reportedUserId),
        reason: dispute.reason,
        description: dispute.description,
        evidence: dispute.evidence,
        status: dispute.status,
        resolutionMessage: dispute.resolutionMessage,
        resolvedBy: dispute.resolvedBy ? new Types.ObjectId(dispute.resolvedBy) : null,
        resolvedAt: dispute.resolvedAt,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
      });
      return DisputeRepoMapper.toEntityFromDocument(doc);
    }
  }

  async findByAppointmentAndReporter(
    appointmentId: string,
    reporterId: string,
  ): Promise<Dispute | null> {
    if (!Types.ObjectId.isValid(appointmentId) || !Types.ObjectId.isValid(reporterId)) {
      return null;
    }
    const doc = await disputeModel.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
      reporterId: new Types.ObjectId(reporterId),
    });
    return doc ? DisputeRepoMapper.toEntityFromDocument(doc) : null;
  }

  async findByAppointmentId(appointmentId: string): Promise<Dispute[]> {
    if (!Types.ObjectId.isValid(appointmentId)) {
      return [];
    }
    const docs = await disputeModel.find({
      appointmentId: new Types.ObjectId(appointmentId),
    });
    return docs.map((doc) => DisputeRepoMapper.toEntityFromDocument(doc));
  }

  async findAllWithFilters(
    filters: DisputeFilterParams,
  ): Promise<PaginatedDisputes> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [];

    // Perform lookups to join reporter and reported user details
    pipeline.push(
      {
        $lookup: {
          from: "auths",
          localField: "reporterId",
          foreignField: "_id",
          as: "reporter",
        },
      },
      { $unwind: { path: "$reporter", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "auths",
          localField: "reportedUserId",
          foreignField: "_id",
          as: "reportedUser",
        },
      },
      { $unwind: { path: "$reportedUser", preserveNullAndEmptyArrays: true } },
    );

    const matchConditions: Record<string, unknown>[] = [];

    // Filter by Reporter Role
    if (filters.reporterRole && filters.reporterRole !== "All") {
      matchConditions.push({ "reporter.role": filters.reporterRole.toLowerCase() });
    }

    // Filter by Reported User Role
    if (filters.reportedUserRole && filters.reportedUserRole !== "All") {
      matchConditions.push({ "reportedUser.role": filters.reportedUserRole.toLowerCase() });
    }

    // Filter by Status
    if (filters.status && filters.status !== "All") {
      matchConditions.push({ status: filters.status });
    }

    // Filter by Time Range or Custom Dates
    if (filters.startDate || filters.endDate) {
      const startOfRange = filters.startDate ? new Date(filters.startDate) : null;
      if (startOfRange) {
        startOfRange.setHours(0, 0, 0, 0);
      }
      const endOfRange = filters.endDate ? new Date(filters.endDate) : new Date();
      endOfRange.setHours(23, 59, 59, 999);

      const dateQuery: Record<string, any> = {};
      if (startOfRange) dateQuery.$gte = startOfRange;
      if (endOfRange) dateQuery.$lte = endOfRange;

      matchConditions.push({ createdAt: dateQuery });
    } else if (filters.timeRange && filters.timeRange.toLowerCase() !== "all") {
      const now = new Date();
      let startOfRange: Date | null = null;
      const lowerTimeRange = filters.timeRange.toLowerCase();

      if (lowerTimeRange === "today") {
        startOfRange = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (lowerTimeRange === "last 7 days" || lowerTimeRange === "7days") {
        startOfRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (lowerTimeRange === "last 30 days" || lowerTimeRange === "30days") {
        startOfRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (lowerTimeRange === "last 90 days" || lowerTimeRange === "90days") {
        startOfRange = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      }

      if (startOfRange) {
        matchConditions.push({ createdAt: { $gte: startOfRange } });
      }
    }

    // Search filter: Doctor Name, Patient Name, Description
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: "i" };
      matchConditions.push({
        $or: [
          { "reporter.name": searchRegex },
          { "reportedUser.name": searchRegex },
          { description: searchRegex },
        ],
      });
    }

    if (matchConditions.length > 0) {
      pipeline.push({ $match: { $and: matchConditions } });
    }

    // Add sort stage
    const sortOrder = filters.sort === "oldest" ? 1 : -1;
    pipeline.push({ $sort: { createdAt: sortOrder } });

    // Execute count pipeline to find total documents
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await disputeModel.aggregate(countPipeline);
    const total = countResult[0]?.total ?? 0;

    // Execute paginated listing query
    pipeline.push({ $skip: skip }, { $limit: limit });

    const rawResults = await disputeModel.aggregate(pipeline);

    const disputes: DisputeListItem[] = rawResults.map((raw) => ({
      id: raw._id.toString(),
      createdAt: raw.createdAt,
      reporterId: raw.reporterId.toString(),
      reporterName: raw.reporter?.name ?? "Unknown",
      reporterRole: raw.reporter?.role ?? "unknown",
      reportedUserId: raw.reportedUserId.toString(),
      reportedUserName: raw.reportedUser?.name ?? "Unknown",
      reportedUserRole: raw.reportedUser?.role ?? "unknown",
      reason: raw.reason,
      status: raw.status,
    }));

    return {
      disputes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
