import { IRescheduleRequestDocument } from "../../DB/models/rescheduleRequestModel";
import RescheduleRequest from "../../../domain/entities/rescheduleRequest";
import { RescheduleStatus } from "../../../domain/enums/rescheduleStatus";

export class RescheduleRequestRepoMapper {
  static toEntityFromDocument(doc: IRescheduleRequestDocument): RescheduleRequest {
    return new RescheduleRequest({
      id: doc._id.toString(),
      appointmentId: doc.appointmentId.toString(),
      oldSlotId: doc.oldSlotId.toString(),
      newSlotId: doc.newSlotId.toString(),
      doctorId: doc.doctorId.toString(),
      patientId: doc.patientId.toString(),
      status: doc.status as RescheduleStatus,
      reason: doc.reason,
      customReason: doc.customReason,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
