import { FilterQuery } from "mongoose";
import { IOrganizationRepository } from "../../domain/interfaces/repositories/IOrganizationRepository";
import { Organization } from "../../domain/entities/organization";
import {
  OrganizationModel,
  IOrganizationDocument,
} from "../DB/models/organizationModel";
import { OrganizationMapper } from "../../application/mappers/organizationMapper";
import { getOrganizationsRequestDTO } from "../../application/DTOs/organization/organizationDTO";
import { BaseRepository } from "./base/BaseRepository";
import { TimePeriod } from "../../domain/enums/timePeriod";
import { OrganizationTrendRaw } from "../../domain/interfaces/repositories/adminDashboardRepositoryTypes";

export class OrganizationRepository
  extends BaseRepository<IOrganizationDocument>
  implements IOrganizationRepository {
  constructor() {
    super(OrganizationModel);
  }

  async findById(id: string): Promise<Organization | null> {
    const organization = await this.findDocumentById(id);
    return organization
      ? OrganizationMapper.toEntityFromDocument(organization)
      : null;
  }

  async findByEmail(email: string): Promise<Organization | null> {
    const doc = await OrganizationModel.findOne({ email });
    return doc ? OrganizationMapper.toEntityFromDocument(doc) : null;
  }

  async findByCode(code: string): Promise<Organization | null> {
    const doc = await OrganizationModel.findOne({ organizationCode: code });
    return doc ? OrganizationMapper.toEntityFromDocument(doc) : null;
  }

  async save(organization: Organization): Promise<Organization> {
    const updateData = {
      name: organization.name,
      organizationType: organization.organizationType,
      location: organization.location
        ? {
          type: "Point",
          coordinates: organization.location.coordinates,
          address: organization.location.address,
          placeId: organization.location.placeId,
        }
        : undefined,
      accountHolderName: organization.accountHolderName,
      bankName: organization.bankName,
      accountNumber: organization.accountNumber,
      ifscCode: organization.ifscCode,
      upiId: organization.upiId || "",
      isVerified: organization.isVerified,
      isBlocked: organization.isBlocked,
      email: organization.email,
      organizationCode: organization.organizationCode || null,
      verificationStatus: organization.verificationStatus,
      rejectionReason: organization.rejectionReason || null,
      submissionHistory: organization.submissionHistory?.map((hist) => ({
        submittedAt: hist.submittedAt,
        status: hist.status,
        rejectionReason: hist.rejectionReason || null,
      })) || [],
    };

    if (organization.id) {
      const updated = await OrganizationModel.findByIdAndUpdate(
        organization.id,
        updateData,
        { new: true },
      );
      if (!updated) {
        throw new Error("Organization not found");
      }
      return OrganizationMapper.toEntityFromDocument(updated);
    } else {
      const created = await OrganizationModel.create(updateData);
      return OrganizationMapper.toEntityFromDocument(created);
    }
  }

  async findAll(
    query?: getOrganizationsRequestDTO,
  ): Promise<{ organizations: Organization[]; total: number }> {
    const filterQuery: FilterQuery<IOrganizationDocument> = {};

    if (query) {
      const page = query.page || 1;
      const limit = query.limit || 10;

      if (query.search) {
        const regex = { $regex: query.search, $options: "i" };
        filterQuery.$or = [
          { name: regex },
          { accountHolderName: regex },
          { bankName: regex },
          { accountNumber: regex },
          { ifscCode: regex },
          { upiId: regex },
          { organizationCode: regex },
        ];
      }

      if (query.isBlocked !== undefined) {
        filterQuery.isBlocked = query.isBlocked;
      }

      if (query.verificationStatus) {
        filterQuery.verificationStatus = query.verificationStatus;
      }

      if (query.organizationType) {
        filterQuery.organizationType = query.organizationType;
      }

      const total = await OrganizationModel.countDocuments(filterQuery);
      const docs = await OrganizationModel.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return {
        organizations: OrganizationMapper.toEntityListFromDocumentList(docs),
        total,
      };
    }

    const docs = await OrganizationModel.find({
      isBlocked: false,
      verificationStatus: "VERIFIED",
    }).sort({ name: 1 });

    return {
      organizations: OrganizationMapper.toEntityListFromDocumentList(docs),
      total: docs.length,
    };
  }

  async countAll(): Promise<number> {
    return await OrganizationModel.countDocuments();
  }

  async deleteById(id: string): Promise<void> {
    await OrganizationModel.findByIdAndDelete(id);
  }

  async getRegistrationTrends(
    startDate: Date,
    endDate: Date,
    period: TimePeriod,
  ): Promise<OrganizationTrendRaw[]> {
    let dateId;
    switch (period) {
      case TimePeriod.DAILY:
        dateId = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" },
        };
        break;
      case TimePeriod.WEEKLY:
        dateId = {
          $dateToString: { format: "%G-W%V", date: "$createdAt", timezone: "Asia/Kolkata" },
        };
        break;
      case TimePeriod.MONTHLY:
        dateId = {
          $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "Asia/Kolkata" },
        };
        break;
      case TimePeriod.YEARLY:
        dateId = {
          $dateToString: { format: "%Y", date: "$createdAt", timezone: "Asia/Kolkata" },
        };
        break;
    }

    return await OrganizationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: dateId,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}
