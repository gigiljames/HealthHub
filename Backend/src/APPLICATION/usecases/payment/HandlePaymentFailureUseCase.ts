import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPaymentRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

export class HandlePaymentFailureUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly slotRepository: ISlotRepository,
  ) {}

  async execute(gatewayRef: string, reason: string): Promise<void> {
    const payment = await this.paymentRepository.findByGatewayRef(gatewayRef);
    if (!payment) throw new Error("Payment record not found");
    if (payment.status === PaymentStatus.FAILED) return;

    const appointment = await this.appointmentRepository.findById(
      payment.appointmentId,
    );
    if (!appointment) throw new Error("Appointment not found");

    // make this a transaction
    await this.paymentRepository.updatePaymentStatus(
      payment.id as string,
      PaymentStatus.FAILED,
    );
    await this.appointmentRepository.updateStatus(
      appointment.id as string,
      AppointmentStatus.CANCELLED,
    );

    await this.slotRepository.unlockSlot(appointment.slotId);
  }
}
