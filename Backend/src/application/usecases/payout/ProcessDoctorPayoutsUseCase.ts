import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IPayoutRepository } from "../../../domain/interfaces/repositories/IPayoutRepository";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { env } from "../../../config/envConfig";
import { IProcessDoctorPayoutsUsecase } from "../../../domain/interfaces/usecases/payout/IProcessDoctorPayoutsUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { ProcessPayoutResponseDTO } from "../../DTOs/payout/payoutDTO";
import { PayoutStatus } from "../../../domain/enums/payoutStatus";
import { PayoutMapper } from "../../mappers/payoutMapper";

export class ProcessDoctorPayoutsUseCase implements IProcessDoctorPayoutsUsecase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _payoutRepository: IPayoutRepository,
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _walletRepository: IWalletRepository,
  ) {}

  async execute(
    doctorId: string,
    cutoffDate: Date,
  ): Promise<ProcessPayoutResponseDTO> {
    const appointments =
      await this._appointmentRepository.getEligibleAppointmentsForPayout(
        doctorId,
        cutoffDate,
      );

    if (!appointments || appointments.length === 0) {
      return {
        status: "NO_PAYOUT_NEEDED",
        message: "No unpaid completed appointments found.",
      };
    }

    let grossAmount = 0;
    let platformCommissions = 0;
    const appointmentIds = appointments.map((app) => app.id as string);

    for (const appointmentId of appointmentIds) {
      const appt = await this._appointmentRepository.findById(appointmentId);
      if (appt) {
        if (appt.consultationFee && appt.consultationFee > 0) {
          grossAmount += appt.consultationFee + (appt.platformFee || 0);
          platformCommissions += appt.platformFee || 0;
        } else {
          // Backward compatibility fallback for old bookings without stored fee snapshot
          const transaction =
            await this._transactionRepository.findByAppointmentId(appointmentId);
          if (transaction && transaction.status === PaymentStatus.SUCCESS) {
            grossAmount += transaction.amount;
            platformCommissions += (transaction.amount * env.PLATFORM_COMMISSION) / 100;
          }
        }
      }
    }

    if (grossAmount === 0) {
      return {
        status: "NO_PAYOUT_NEEDED",
        message: "Total payable amount is 0.",
      };
    }

    const netAmountToTransfer = grossAmount - platformCommissions;

    const payout = await this._payoutRepository.createPayoutRecord({
      doctorId,
      amount: netAmountToTransfer,
      currency: "INR",
      grossAmount,
      platformCommissions,
      appointmentIds,
    });

    await this._appointmentRepository.updatePayoutId(
      appointmentIds,
      payout.id as string,
    );

    try {
      const wallet = await this._walletRepository.findByUserId(doctorId);
      if (!wallet || !wallet.id) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.DOCTOR.WALLET_NOT_FOUND,
        );
      }

      const adminAuth = await authModel.findOne({ email: "admin@gmail.com" });
      if (!adminAuth)
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.ADMIN.NOT_FOUND,
        );
      const adminWallet = await this._walletRepository.findByUserId(
        adminAuth._id.toString(),
      );
      if (!adminWallet)
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.ADMIN.WALLET_NOT_FOUND,
        );

      // Debit Admin Wallet
      await this._walletRepository.updateBalance(
        adminWallet.id as string,
        -netAmountToTransfer,
      );

      // Credit Doctor Wallet
      await this._walletRepository.updateBalance(
        wallet.id as string,
        netAmountToTransfer,
      );

      // Debit from Admin Wallet
      await this._transactionRepository.createTransaction({
        direction: TransactionDirection.DEBIT,
        type: TransactionType.DOCTOR_PAYOUT,
        source: TransactionSource.WALLET,
        amount: netAmountToTransfer,
        currency: "INR",
        walletId: adminWallet.id,
        userId: adminAuth._id.toString(),
        payoutId: payout.id,
        status: PaymentStatus.SUCCESS,
      });

      // Credit to Doctor Wallet
      const doctorTransaction =
        await this._transactionRepository.createTransaction({
          direction: TransactionDirection.CREDIT,
          type: TransactionType.DOCTOR_PAYOUT,
          source: TransactionSource.WALLET,
          amount: netAmountToTransfer,
          currency: "INR",
          walletId: wallet.id,
          userId: doctorId,
          payoutId: payout.id,
          status: PaymentStatus.SUCCESS,
        });

      payout.transactionId = doctorTransaction.id;
      payout.status = PayoutStatus.PROCESSED;
      await this._payoutRepository.markPayoutProcessed(
        payout.id as string,
        doctorTransaction.id as string,
      );

      return PayoutMapper.toProcessPayoutResponseDTO(
        "SUCCESS",
        undefined,
        payout.id || undefined,
      );
    } catch (e) {
      return PayoutMapper.toProcessPayoutResponseDTO(
        "FAILED",
        e instanceof Error ? e.message : "Gateway error",
      );
    }
  }
}
