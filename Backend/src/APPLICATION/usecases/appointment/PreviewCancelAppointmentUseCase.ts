import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IPreviewCancelAppointmentUseCase } from "../../../domain/interfaces/usecases/appointment/IPreviewCancelAppointmentUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { MESSAGES } from "../../../domain/constants/messages";

export class PreviewCancelAppointmentUseCase implements IPreviewCancelAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly slotRepository: ISlotRepository,
  ) {}

  async execute(
    appointmentId: string,
    patientId: string,
  ): Promise<{
    refundAmount: number;
    refundPercentage: number;
    expiresAt: Date | null;
  }> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }

    if (appointment.patientId !== patientId) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.ACCESS_DENIED);
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Only confirmed appointments can be cancelled.",
      );
    }

    const slot = await this.slotRepository.findById(appointment.slotId);
    if (!slot) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.SLOT.NOT_FOUND);
    }

    const { refundPercentage, expiresAt } = this.calculateRefundRules(
      new Date(slot.start),
      new Date(),
    );

    const appointmentDetails =
      await this.appointmentRepository.getPatientAppointmentById(
        appointmentId,
        patientId,
      );
    if (!appointmentDetails || !appointmentDetails.payment) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Payment details not found for this appointment.",
      );
    }

    const paidAmount = appointmentDetails.payment.amount;
    const refundAmount = (paidAmount * refundPercentage) / 100;

    return {
      refundAmount,
      refundPercentage,
      expiresAt,
    };
  }

  private calculateRefundRules(
    slotStart: Date,
    now: Date,
  ): { refundPercentage: number; expiresAt: Date | null } {
    const diffMs = slotStart.getTime() - now.getTime();
    const hours = diffMs / (1000 * 60 * 60);

    if (hours > 24) {
      const expiresAt = new Date(slotStart.getTime() - 24 * 60 * 60 * 1000);
      return { refundPercentage: 100, expiresAt };
    } else if (hours > 12) {
      const expiresAt = new Date(slotStart.getTime() - 12 * 60 * 60 * 1000);
      return { refundPercentage: 50, expiresAt };
    } else if (hours > 6) {
      const expiresAt = new Date(slotStart.getTime() - 6 * 60 * 60 * 1000);
      return { refundPercentage: 25, expiresAt };
    } else {
      return { refundPercentage: 0, expiresAt: null };
    }
  }
}
