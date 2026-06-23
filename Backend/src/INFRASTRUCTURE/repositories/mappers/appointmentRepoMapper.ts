import { IAppointmentDocument } from "../../DB/models/appointmentModel";
import Appointment from "../../../domain/entities/appointment";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

export class AppointmentRepoMapper {
  static toEntityFromDocument(doc: IAppointmentDocument): Appointment {
    return new Appointment({
      id: doc._id.toString(),
      patientId: doc.patientId.toString(),
      doctorId: doc.doctorId.toString(),
      slotId: doc.slotId.toString(),
      status: doc.status as AppointmentStatus,
      reason: doc.reason,
      paymentId: doc.paymentId?.toString() || null,
      payoutId: doc.payoutId?.toString() || null,
      refundTransactionId: doc.refundTransactionId?.toString() || null,
      cancellationReason: doc.cancellationReason || null,
    });
  }
}
