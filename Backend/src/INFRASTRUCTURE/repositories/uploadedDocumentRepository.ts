import { Types } from "mongoose";
import { BaseRepository } from "./base/BaseRepository";
import {
  IUploadedDocumentRepository,
  IUploadedDocumentFilterParams,
  IPaginatedUploadedDocuments,
} from "../../domain/interfaces/repositories/IUploadedDocumentRepository";
import {
  uploadedDocumentModel,
  IUploadedDocumentDocument,
} from "../DB/models/uploadedDocumentModel";
import { UploadedDocument } from "../../domain/entities/uploadedDocument";
import { UploadedDocumentRepoMapper } from "./mappers/uploadedDocumentRepoMapper";

export class UploadedDocumentRepository
  extends BaseRepository<IUploadedDocumentDocument>
  implements IUploadedDocumentRepository
{
  constructor() {
    super(uploadedDocumentModel);
  }

  async create(data: Partial<UploadedDocument>): Promise<UploadedDocument> {
    const docData = {
      patientId: new Types.ObjectId(data.patientId),
      title: data.title,
      category: data.category,
      customCategory: data.customCategory,
      specializationId: data.specializationId ? new Types.ObjectId(data.specializationId) : undefined,
      customSpecialization: data.customSpecialization,
      fileKey: data.fileKey,
      thumbnailKey: data.thumbnailKey,
      reportDate: data.reportDate,
    };
    const [doc] = await this.model.create([docData]);
    return UploadedDocumentRepoMapper.toEntityFromDocument(doc);
  }

  async findById(id: string): Promise<UploadedDocument | null> {
    const doc = await this.findDocumentById(id);
    return doc ? UploadedDocumentRepoMapper.toEntityFromDocument(doc) : null;
  }

  async update(id: string, data: Partial<UploadedDocument>): Promise<UploadedDocument> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.customCategory !== undefined) updateData.customCategory = data.customCategory;
    if (data.specializationId !== undefined) {
      updateData.specializationId = data.specializationId ? new Types.ObjectId(data.specializationId) : null;
    }
    if (data.customSpecialization !== undefined) updateData.customSpecialization = data.customSpecialization;
    if (data.reportDate !== undefined) updateData.reportDate = data.reportDate;

    const doc = await this.model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    if (!doc) {
      throw new Error("Uploaded document not found for update");
    }
    return UploadedDocumentRepoMapper.toEntityFromDocument(doc);
  }

  async getPatientDocuments(
    patientId: string,
    page: number,
    limit: number,
    filters: IUploadedDocumentFilterParams
  ): Promise<IPaginatedUploadedDocuments> {
    const skip = (page - 1) * limit;
    const matchStage: any = { patientId: new Types.ObjectId(patientId) };

    if (filters.search) {
      matchStage.title = new RegExp(filters.search, "i");
    }

    if (filters.category) {
      if (filters.category.toLowerCase() === "other") {
        matchStage.customCategory = { $ne: null, $exists: true };
      } else {
        matchStage.category = filters.category;
      }
    }

    if (filters.specialization) {
      if (filters.specialization.toLowerCase() === "other") {
        matchStage.specializationId = null;
        matchStage.customSpecialization = { $ne: null, $exists: true };
      } else if (Types.ObjectId.isValid(filters.specialization)) {
        matchStage.specializationId = new Types.ObjectId(filters.specialization);
      }
    }

    if (filters.startDate || filters.endDate) {
      const dateRange: any = {};
      if (filters.startDate) dateRange.$gte = filters.startDate;
      if (filters.endDate) dateRange.$lte = filters.endDate;
      matchStage.reportDate = dateRange;
    }

    // Sorting
    const sortStage: any = {};
    const sortBy = filters.sortBy || "reportDate";
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
    sortStage[sortBy] = sortOrder;

    const [countResult, docs] = await Promise.all([
      this.model.countDocuments(matchStage),
      this.model.find(matchStage).sort(sortStage).skip(skip).limit(limit),
    ]);

    const total = countResult;
    const documents = docs.map((doc) => UploadedDocumentRepoMapper.toEntityFromDocument(doc));

    return {
      documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
