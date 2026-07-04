import Appointment from "../../../entities/appointment";

export interface IBookAppointmentUsecase {
  execute(
    slotId: string,
    patientId: string,
    reason: string,
    amount: number,
    currency: string,
    paymentMode: "stripe" | "wallet",
  ): Promise<{ appointment: Appointment; paymentUrl?: string }>;
}
