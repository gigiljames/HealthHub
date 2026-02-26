import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IPayoutRepository } from "../../../domain/interfaces/repositories/IPayoutRepository";
import { IPayoutGateway } from "../../../domain/interfaces/gateways/IPayoutGateway";

export class ProcessDoctorPayoutsUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly payoutRepository: IPayoutRepository,
    private readonly payoutGateway: IPayoutGateway,
  ) {}

  async execute(doctorId: string, payoutAccountId: string): Promise<any> {
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
      currency: "USD",
      appointmentIds,
    });

    await this.appointmentRepository.updatePayoutId(
      appointmentIds,
      payout.id as string,
    );

    try {
      const { gatewayRef } = await this.payoutGateway.transferFunds(
        payoutAccountId,
        netAmountToTransfer,
        "USD",
      );
      await this.payoutRepository.markPayoutProcessed(
        payout.id as string,
        gatewayRef,
      );
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
