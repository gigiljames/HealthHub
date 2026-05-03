import DoctorException from "../../domain/entities/doctorException";
import { IDoctorExceptionDocument } from "../../infrastructure/DB/models/doctorExceptionModel";
import { doctorExceptionDTO } from "../DTOs/doctorException/doctorExceptionDTO";

export class DoctorExceptionMapper {
  static toEntityFromDocument(doc: IDoctorExceptionDocument): DoctorException {
    return new DoctorException({
      id: doc._id.toString(),
      doctorId: doc.doctorId.toString(),
      reason: doc.reason,
      startDatetime: doc.startDatetime,
      endDatetime: doc.endDatetime,
    });
  }

  static toEntityListFromDocumentList(
    docs: IDoctorExceptionDocument[],
  ): DoctorException[] {
    return docs.map((doc) => this.toEntityFromDocument(doc));
  }

  static toDTOFromEntity(exception: DoctorException): doctorExceptionDTO {
    return {
      id: exception.id ?? undefined,
      doctorId: exception.doctorId,
      reason: exception.reason,
      startDatetime: exception.startDatetime.toISOString(),
      endDatetime: exception.endDatetime.toISOString(),
    };
  }

  static toDTOListFromEntityList(
    exceptions: DoctorException[],
  ): doctorExceptionDTO[] {
    return exceptions.map((e) => this.toDTOFromEntity(e));
  }
}
