import { AppointmentSummaryDTO } from "../../../../application/DTOs/booking/bookingDTO";

export interface IGetAppointmentSummaryUseCase {
  execute(slotId: string): Promise<AppointmentSummaryDTO>;
}
