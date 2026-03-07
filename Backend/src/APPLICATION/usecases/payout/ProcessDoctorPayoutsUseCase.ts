import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IPayoutRepository } from "../../../domain/interfaces/repositories/IPayoutRepository";
import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionSource } from "../../../domain/enums/transactionSource";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { authModel } from "../../../infrastructure/DB/models/authModel";

export class ProcessDoctorPayoutsUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly payoutRepository: IPayoutRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(doctorId: string): Promise<any> {
    const appointments =
      await this.appointmentRepository.findCompletableAppointmentsWithNoPayout(
        doctorId,
      );
    if (!appointments || appointments.length === 0) {
      return {
        status: "NO_PAYOUT_NEEDED",
        message: "No unpaid completed appointments found.",
      };
    }

    // mock platform fee calculation
    let totalDeductions = appointments.length * 10;
    let netAmountToTransfer = appointments.length * 100 - totalDeductions;

    const appointmentIds = appointments.map((app) => app.id as string);
    const payout = await this.payoutRepository.createPayoutRecord({
      doctorId,
      amount: netAmountToTransfer,
      currency: "INR",
      appointmentIds,
    });

    await this.appointmentRepository.updatePayoutId(
      appointmentIds,
      payout.id as string,
    );

    try {
      await this.payoutRepository.markPayoutProcessed(payout.id as string);

      const wallet = await this.walletRepository.findByUserId(doctorId);
      if (!wallet || !wallet.id) {
        throw new Error("Doctor wallet not found");
      }

      const adminAuth = await authModel.findOne({ email: "admin@gmail.com" });
      if (!adminAuth) throw new Error("Admin record not found");
      const adminWallet = await this.walletRepository.findByUserId(
        adminAuth._id.toString(),
      );
      if (!adminWallet) throw new Error("Admin wallet not found");

      // Debit Admin Wallet
      await this.walletRepository.updateBalance(
        adminWallet.id as string,
        -netAmountToTransfer,
      );

      // Credit Doctor Wallet
      await this.walletRepository.updateBalance(
        wallet.id as string,
        netAmountToTransfer,
      );

      // Debit from Admin Wallet
      await this.transactionRepository.createTransaction({
        direction: TransactionDirection.DEBIT,
        type: TransactionType.DOCTOR_PAYOUT,
        source: TransactionSource.WALLET,
        amount: netAmountToTransfer,
        currency: "USD",
        walletId: adminWallet.id,
        payoutId: payout.id,
        status: PaymentStatus.SUCCESS,
      });

      // Credit to Doctor Wallet
      await this.transactionRepository.createTransaction({
        direction: TransactionDirection.CREDIT,
        type: TransactionType.DOCTOR_PAYOUT,
        source: TransactionSource.WALLET,
        amount: netAmountToTransfer,
        currency: "USD",
        walletId: wallet.id,
        payoutId: payout.id,
        status: PaymentStatus.SUCCESS,
      });

      return { status: "SUCCESS", payoutId: payout.id };
    } catch (e) {
      // handle gateway failure
      return {
        status: "FAILED",
        message: e instanceof Error ? e.message : "Gateway error",
      };
    }
  }
}
