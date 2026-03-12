import { IGetDoctorPayoutsUseCase } from "../../../domain/interfaces/usecases/payout/IGetDoctorPayoutsUseCase";
import {
  IPayoutRepository,
  PaginatedPayouts,
  PayoutFilterParams,
} from "../../../domain/interfaces/repositories/IPayoutRepository";

export class GetDoctorPayoutsUseCase implements IGetDoctorPayoutsUseCase {
  constructor(private readonly payoutRepository: IPayoutRepository) {}

  async execute(
    doctorId: string,
    filters: PayoutFilterParams,
  ): Promise<PaginatedPayouts> {
    return this.payoutRepository.getDoctorPayouts(doctorId, filters);
  }
}
