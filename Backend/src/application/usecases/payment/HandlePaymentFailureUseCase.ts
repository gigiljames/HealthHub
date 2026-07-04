import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus";
import { IHandlePaymentFailureUsecase } from "../../../domain/interfaces/usecases/payment/IHandlePaymentFailureUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class HandlePaymentFailureUseCase implements IHandlePaymentFailureUsecase {
  constructor(
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
  ) {}

  async execute(gatewayRef: string): Promise<void> {
    const transaction =
      await this._transactionRepository.findByGatewayRef(gatewayRef);
    if (!transaction)
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.TRANSACTION.NOT_FOUND,
      );
    if (transaction.status === PaymentStatus.FAILED) return;

    const appointment = await this._appointmentRepository.findById(
      transaction.appointmentId as string,
    );
    if (!appointment)
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );

    // make this a transaction
    await this._transactionRepository.updateStatus(
      transaction.id as string,
      PaymentStatus.FAILED,
    );
    await this._appointmentRepository.updateStatus(
      appointment.id as string,
      AppointmentStatus.CANCELLED,
    );

    await this._slotRepository.unlockSlot(appointment.slotId);
  }
}
