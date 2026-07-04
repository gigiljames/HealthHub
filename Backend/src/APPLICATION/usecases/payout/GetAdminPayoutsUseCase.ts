import { IGetAdminPayoutsUseCase } from "../../../domain/interfaces/usecases/payout/IGetAdminPayoutsUseCase";
import {
  IPayoutRepository,
  PaginatedPayouts,
  PayoutFilterParams,
} from "../../../domain/interfaces/repositories/IPayoutRepository";

export class GetAdminPayoutsUseCase implements IGetAdminPayoutsUseCase {
  constructor(private readonly _payoutRepository: IPayoutRepository) {}

  async execute(filters: PayoutFilterParams): Promise<PaginatedPayouts> {
    return this._payoutRepository.getAdminPayouts(filters);
  }
}
