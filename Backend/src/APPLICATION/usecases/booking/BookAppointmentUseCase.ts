import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IPaymentGateway } from "../../../domain/interfaces/gateways/IPaymentGateway";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPaymentRepository";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import Appointment from "../../../domain/entities/appointment";

export class BookAppointmentUseCase {
  constructor(
    private readonly slotRepository: ISlotRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(
    slotId: string,
    patientId: string,
    reason: string,
    amount: number,
    currency: string,
  ): Promise<{ appointment: Appointment; paymentUrl: string }> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) throw new Error("Slot not found");
    const now = new Date();
    if (
      slot.lockedBy !== patientId ||
      !slot.lockedUntil ||
      slot.lockedUntil < now
    ) {
      throw new Error("Slot lock has expired or belongs to someone else.");
    }

    const appointment = await this.appointmentRepository.createAppointment({
      patientId,
      doctorId: slot.doctorId,
      slotId,
      status: AppointmentStatus.PENDING_PAYMENT,
      reason,
    });

    const { gatewayRef, paymentUrl } = await this.paymentGateway.createIntent(
      amount,
      currency,
      { appointmentId: appointment.id },
    );

    const payment = await this.paymentRepository.createPaymentRecord({
      amount,
      currency,
      appointmentId: appointment.id,
      patientId,
      status: PaymentStatus.INITIATED,
      gatewayRef,
    });

    await this.appointmentRepository.updatePaymentId(
      appointment.id as string,
      payment.id as string,
    );

    return { appointment, paymentUrl };
  }
}
