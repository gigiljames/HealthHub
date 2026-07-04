import { Types } from "mongoose";
import DoctorException from "../../domain/entities/doctorException";
import { IDoctorExceptionRepository } from "../../domain/interfaces/repositories/IDoctorExceptionRepository";
import {
  doctorExceptionModel,
  IDoctorExceptionDocument,
} from "../DB/models/doctorExceptionModel";
import { DoctorExceptionMapper } from "../../application/mappers/doctorExceptionMapper";
import { BaseRepository } from "./base/BaseRepository";

export class DoctorExceptionRepository
  extends BaseRepository<IDoctorExceptionDocument>
  implements IDoctorExceptionRepository
{
  constructor() {
    super(doctorExceptionModel);
  }

  async findById(id: string): Promise<DoctorException | null> {
    const doc = await this.findDocumentById(id);
    return doc ? DoctorExceptionMapper.toEntityFromDocument(doc) : null;
  }

  async findByDoctorId(doctorId: string): Promise<DoctorException[]> {
    const docs = await doctorExceptionModel.find({
      doctorId: new Types.ObjectId(doctorId),
    });
    return DoctorExceptionMapper.toEntityListFromDocumentList(docs);
  }

  async findExceptionsInRange(
    doctorId: string,
    start: Date,
    end: Date,
  ): Promise<DoctorException[]> {
    const docs = await doctorExceptionModel.find({
      doctorId: new Types.ObjectId(doctorId),
      startDatetime: { $lt: end },
      endDatetime: { $gt: start },
    });
    return DoctorExceptionMapper.toEntityListFromDocumentList(docs);
  }

  async save(exception: DoctorException): Promise<DoctorException> {
    if (exception.id) {
      const doc = await doctorExceptionModel.findByIdAndUpdate(
        exception.id,
        {
          reason: exception.reason,
          startDatetime: exception.startDatetime,
          endDatetime: exception.endDatetime,
        },
        { new: true },
      );
      if (!doc) {
        throw new Error("Doctor exception not found");
      }
      return DoctorExceptionMapper.toEntityFromDocument(doc);
    } else {
      const doc = await doctorExceptionModel.create({
        doctorId: exception.doctorId,
        reason: exception.reason,
        startDatetime: exception.startDatetime,
        endDatetime: exception.endDatetime,
      });
      return DoctorExceptionMapper.toEntityFromDocument(doc);
    }
  }
}
