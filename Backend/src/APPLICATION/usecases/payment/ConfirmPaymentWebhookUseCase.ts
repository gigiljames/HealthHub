import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPaymentRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

export class ConfirmPaymentWebhookUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly slotRepository: ISlotRepository,
  ) {}

  async execute(gatewayRef: string): Promise<void> {
    const payment = await this.paymentRepository.findByGatewayRef(gatewayRef);
    if (!payment) throw new Error("Payment record not found");
    if (payment.status === PaymentStatus.SUCCESS) return;

    const appointment = await this.appointmentRepository.findById(
      payment.appointmentId,
    );
    if (!appointment) throw new Error("Appointment not found");

    // make this a transaction
    await this.paymentRepository.updatePaymentStatus(
      payment.id as string,
      PaymentStatus.SUCCESS,
    );
    await this.appointmentRepository.updateStatus(
      appointment.id as string,
      AppointmentStatus.CONFIRMED,
    );
    await this.slotRepository.markSlotAsBooked(
      appointment.slotId,
      appointment.id as string,
    );
  }
}
