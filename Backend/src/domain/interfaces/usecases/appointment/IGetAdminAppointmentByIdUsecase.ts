import { AdminAppointmentDetailsDTO } from "../../../../application/DTOs/appointment/appointmentDTO";

export interface IGetAdminAppointmentByIdUsecase {
  execute(appointmentId: string): Promise<AdminAppointmentDetailsDTO | null>;
}
