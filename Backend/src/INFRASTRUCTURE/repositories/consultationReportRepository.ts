import { Types } from "mongoose";
import { BaseRepository } from "./base/BaseRepository";
import {
  IConsultationReportRepository,
  IConsultationReportFilterParams,
  IPaginatedConsultationReports,
} from "../../domain/interfaces/repositories/IConsultationReportRepository";
import {
  consultationReportModel,
  IConsultationReportDocument,
} from "../DB/models/consultationReportModel";
import { ConsultationReport } from "../../domain/entities/consultationReport";
import { ConsultationReportRepoMapper } from "./mappers/consultationReportRepoMapper";

export class ConsultationReportRepository
  extends BaseRepository<IConsultationReportDocument>
  implements IConsultationReportRepository
{
  constructor() {
    super(consultationReportModel);
  }

  async create(data: Partial<ConsultationReport>): Promise<ConsultationReport> {
    const docData = {
      appointmentId: new Types.ObjectId(data.appointmentId),
      patientId: new Types.ObjectId(data.patientId),
      doctorId: new Types.ObjectId(data.doctorId),
      chiefComplaint: data.chiefComplaint,
      clinicalNotes: data.clinicalNotes,
      diagnosis: data.diagnosis,
      followUpDate: data.followUpDate,
      followUpNotes: data.followUpNotes,
    };
    const [doc] = await this.model.create([docData]);
    return ConsultationReportRepoMapper.toEntityFromDocument(doc);
  }

  async findByAppointmentId(appointmentId: string): Promise<ConsultationReport | null> {
    if (!Types.ObjectId.isValid(appointmentId)) return null;
    const doc = await this.model.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
    });
    return doc ? ConsultationReportRepoMapper.toEntityFromDocument(doc) : null;
  }

  async findById(id: string): Promise<ConsultationReport | null> {
    const doc = await this.findDocumentById(id);
    return doc ? ConsultationReportRepoMapper.toEntityFromDocument(doc) : null;
  }

  async getPatientReports(
    patientId: string,
    page: number,
    limit: number,
    filters: IConsultationReportFilterParams,
  ): Promise<IPaginatedConsultationReports> {
    const skip = (page - 1) * limit;
    const matchStage: any = { patientId: new Types.ObjectId(patientId) };

    return this.executePaginatedPipeline(matchStage, page, limit, skip, filters);
  }

  async getDoctorReports(
    doctorId: string,
    page: number,
    limit: number,
    filters: IConsultationReportFilterParams,
  ): Promise<IPaginatedConsultationReports> {
    const skip = (page - 1) * limit;
    const matchStage: any = { doctorId: new Types.ObjectId(doctorId) };

    return this.executePaginatedPipeline(matchStage, page, limit, skip, filters);
  }

  private async executePaginatedPipeline(
    matchStage: any,
    page: number,
    limit: number,
    skip: number,
    filters: IConsultationReportFilterParams,
  ): Promise<IPaginatedConsultationReports> {
    const basePipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "auths",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorAuth",
        },
      },
      { $unwind: { path: "$doctorAuth", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "doctorprofiles",
          localField: "doctorId",
          foreignField: "doctorId",
          as: "doctorProfile",
        },
      },
      { $unwind: { path: "$doctorProfile", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "specializations",
          localField: "doctorProfile.specialization",
          foreignField: "_id",
          as: "doctorSpecialization",
        },
      },
      { $unwind: { path: "$doctorSpecialization", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "auths",
          localField: "patientId",
          foreignField: "_id",
          as: "patientAuth",
        },
      },
      { $unwind: { path: "$patientAuth", preserveNullAndEmptyArrays: true } },
    ];

    const filterMatch: any = {};

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      filterMatch.$or = [
        { "doctorAuth.name": searchRegex },
        { "patientAuth.name": searchRegex },
        { chiefComplaint: searchRegex },
        { diagnosis: searchRegex },
        { clinicalNotes: searchRegex },
      ];
    }

    if (filters.specialization) {
      if (Types.ObjectId.isValid(filters.specialization)) {
        filterMatch["doctorProfile.specialization"] = new Types.ObjectId(filters.specialization);
      } else {
        filterMatch["doctorSpecialization.name"] = new RegExp(filters.specialization, "i");
      }
    }

    if (filters.startDate || filters.endDate) {
      const dateRange: any = {};
      if (filters.startDate) dateRange.$gte = filters.startDate;
      if (filters.endDate) dateRange.$lte = filters.endDate;
      filterMatch.createdAt = dateRange;
    }

    if (Object.keys(filterMatch).length > 0) {
      basePipeline.push({ $match: filterMatch });
    }

    const [countResult, docs] = await Promise.all([
      this.model.aggregate([...basePipeline, { $count: "total" }]),
      this.model.aggregate([
        ...basePipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
    ]);

    const total = countResult[0]?.total ?? 0;
    const reports = docs.map((doc) => ConsultationReportRepoMapper.toEntityFromDocument(doc));

    return {
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateByAppointmentId(appointmentId: string, data: Partial<ConsultationReport>): Promise<ConsultationReport> {
    const doc = await this.model.findOneAndUpdate(
      { appointmentId: new Types.ObjectId(appointmentId) },
      {
        $set: {
          chiefComplaint: data.chiefComplaint,
          clinicalNotes: data.clinicalNotes,
          diagnosis: data.diagnosis,
          followUpDate: data.followUpDate,
          followUpNotes: data.followUpNotes,
        }
      },
      { new: true }
    );
    if (!doc) {
      throw new Error("Report not found for update");
    }
    return ConsultationReportRepoMapper.toEntityFromDocument(doc);
  }

  async getPendingFollowUpNotifications(
    now: Date,
    threeDaysFromNow: Date,
  ): Promise<any[]> {
    return await this.model.aggregate([
      {
        $match: {
          followUpDate: {
            $ne: null,
            $gte: now,
            $lte: threeDaysFromNow,
          },
          followUpNotificationSent: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "auths",
          localField: "patientId",
          foreignField: "_id",
          as: "patientAuth",
        },
      },
      { $unwind: { path: "$patientAuth", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "auths",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorAuth",
        },
      },
      { $unwind: { path: "$doctorAuth", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          patientId: 1,
          patientName: "$patientAuth.name",
          patientEmail: "$patientAuth.email",
          doctorName: "$doctorAuth.name",
          followUpDate: 1,
          followUpNotes: 1,
        },
      },
    ]);
  }

  async markFollowUpNotificationSent(reportId: string): Promise<void> {
    await this.model.updateOne(
      { _id: new Types.ObjectId(reportId) },
      { $set: { followUpNotificationSent: true } },
    );
  }
}
