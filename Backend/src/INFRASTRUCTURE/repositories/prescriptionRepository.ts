import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { BaseRepository } from "./base/BaseRepository";
import { CustomError } from "../../domain/entities/customError";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";


import {
  IPrescriptionRepository,
  IPrescriptionFilterParams,
  IPaginatedPrescriptions,
} from "../../domain/interfaces/repositories/IPrescriptionRepository";
import {
  prescriptionModel,
  IPrescriptionDocument,
} from "../DB/models/prescriptionModel";
import { Prescription } from "../../domain/entities/prescription";
import { PrescriptionRepoMapper } from "./mappers/prescriptionRepoMapper";

export class PrescriptionRepository
  extends BaseRepository<IPrescriptionDocument>
  implements IPrescriptionRepository
{
  constructor() {
    super(prescriptionModel);
  }

  async create(data: Partial<Prescription>): Promise<Prescription> {
    const docData = {
      appointmentId: new Types.ObjectId(data.appointmentId),
      patientId: new Types.ObjectId(data.patientId),
      doctorId: new Types.ObjectId(data.doctorId),
      medicines: data.medicines?.map((m) => ({
        medicine: m.medicine,
        dosage: m.dosage,
        frequency: m.frequency,
        timing: m.timing,
        duration: m.duration,
      })),
      verificationToken: data.verificationToken || uuidv4(),
      prescriptionNumber: data.prescriptionNumber || `RX-${uuidv4().split("-")[0].toUpperCase()}`,
      status: data.status || "Valid",
      signatureKey: data.signatureKey,
    };
    const [doc] = await this.model.create([docData]);
    return PrescriptionRepoMapper.toEntityFromDocument(doc);
  }

  async findByAppointmentId(appointmentId: string): Promise<Prescription | null> {
    if (!Types.ObjectId.isValid(appointmentId)) return null;
    const doc = await this.model.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
    });
    if (!doc) return null;
    const laziedDoc = await this.ensureLazyFields(doc);
    return PrescriptionRepoMapper.toEntityFromDocument(laziedDoc);
  }

  async findById(id: string): Promise<Prescription | null> {
    const doc = await this.findDocumentById(id);
    if (!doc) return null;
    const laziedDoc = await this.ensureLazyFields(doc);
    return PrescriptionRepoMapper.toEntityFromDocument(laziedDoc);
  }

  async findByVerificationToken(token: string): Promise<Prescription | null> {
    if (!token) return null;
    const doc = await this.model.findOne({ verificationToken: token });
    if (!doc) return null;
    const laziedDoc = await this.ensureLazyFields(doc);
    return PrescriptionRepoMapper.toEntityFromDocument(laziedDoc);
  }

  private async ensureLazyFields(doc: IPrescriptionDocument): Promise<IPrescriptionDocument> {
    let updated = false;
    if (!doc.verificationToken) {
      doc.verificationToken = uuidv4();
      updated = true;
    }
    if (!doc.prescriptionNumber) {
      doc.prescriptionNumber = `RX-${uuidv4().split("-")[0].toUpperCase()}`;
      updated = true;
    }
    if (!doc.status) {
      doc.status = "Valid";
      updated = true;
    }
    if (updated) {
      await doc.save();
    }
    return doc;
  }


  async getPatientPrescriptions(
    patientId: string,
    page: number,
    limit: number,
    filters: IPrescriptionFilterParams,
  ): Promise<IPaginatedPrescriptions> {
    const skip = (page - 1) * limit;
    const matchStage: any = { patientId: new Types.ObjectId(patientId) };

    return this.executePaginatedPipeline(matchStage, page, limit, skip, filters);
  }

  async getDoctorPrescriptions(
    doctorId: string,
    page: number,
    limit: number,
    filters: IPrescriptionFilterParams,
  ): Promise<IPaginatedPrescriptions> {
    const skip = (page - 1) * limit;
    const matchStage: any = { doctorId: new Types.ObjectId(doctorId) };

    return this.executePaginatedPipeline(matchStage, page, limit, skip, filters);
  }

  private async executePaginatedPipeline(
    matchStage: any,
    page: number,
    limit: number,
    skip: number,
    filters: IPrescriptionFilterParams,
  ): Promise<IPaginatedPrescriptions> {
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
        { "medicines.medicine": searchRegex },
      ];
    }

    if (filters.specialization) {
      if (Types.ObjectId.isValid(filters.specialization)) {
        filterMatch["doctorProfile.specialization"] = new Types.ObjectId(filters.specialization);
      } else {
        filterMatch["doctorSpecialization.name"] = new RegExp(filters.specialization, "i");
      }
    }

    if (filters.doctorId && Types.ObjectId.isValid(filters.doctorId)) {
      filterMatch["doctorId"] = new Types.ObjectId(filters.doctorId);
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
    const prescriptions = docs.map((doc) => PrescriptionRepoMapper.toEntityFromDocument(doc));

    return {
      prescriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateByAppointmentId(appointmentId: string, data: Partial<Prescription>): Promise<Prescription> {
    const updateData: any = {};
    if (data.medicines) {
      updateData.medicines = data.medicines.map((m) => ({
        medicine: m.medicine,
        dosage: m.dosage,
        frequency: m.frequency,
        timing: m.timing,
        duration: m.duration,
      }));
    }
    if (data.status) {
      updateData.status = data.status;
    }
    if (data.signatureKey) {
      updateData.signatureKey = data.signatureKey;
    }

    const doc = await this.model.findOneAndUpdate(
      { appointmentId: new Types.ObjectId(appointmentId) },
      { $set: updateData },
      { new: true }
    );
    if (!doc) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Prescription not found for update.");
    }
    return PrescriptionRepoMapper.toEntityFromDocument(doc);
  }

}
