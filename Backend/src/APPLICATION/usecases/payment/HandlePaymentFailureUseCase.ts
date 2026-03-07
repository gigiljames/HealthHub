import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";

export class HandlePaymentFailureUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly slotRepository: ISlotRepository,
  ) {}

  async execute(gatewayRef: string, reason: string): Promise<void> {
    const transaction =
      await this.transactionRepository.findByGatewayRef(gatewayRef);
    if (!transaction) throw new Error("Transaction record not found");
    if (transaction.status === PaymentStatus.FAILED) return;

    const appointment = await this.appointmentRepository.findById(
      transaction.appointmentId as string,
    );
    if (!appointment) throw new Error("Appointment not found");

    // make this a transaction
    await this.transactionRepository.updateStatus(
      transaction.id as string,
      PaymentStatus.FAILED,
    );
    await this.appointmentRepository.updateStatus(
      appointment.id as string,
      AppointmentStatus.CANCELLED,
    );

    await this.slotRepository.unlockSlot(appointment.slotId);
  }
}
