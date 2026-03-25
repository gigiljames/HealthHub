import { PatientAppointmentDetailsDTO } from "../../../../application/DTOs/appointment/appointmentDTO";

export interface IGetPatientAppointmentByIdUsecase {
  execute(
    appointmentId: string,
    patientId: string,
  ): Promise<PatientAppointmentDetailsDTO | null>;
}
