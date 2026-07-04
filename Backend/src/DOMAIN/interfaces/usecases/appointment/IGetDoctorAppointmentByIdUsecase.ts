import { DoctorAppointmentDetailsDTO } from "../../../../application/DTOs/appointment/appointmentDTO";

export interface IGetDoctorAppointmentByIdUsecase {
  execute(
    appointmentId: string,
    doctorId: string,
  ): Promise<DoctorAppointmentDetailsDTO | null>;
}
