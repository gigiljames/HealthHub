import {
  PaginatedPayouts,
  PayoutFilterParams,
} from "../../repositories/IPayoutRepository";

export interface IGetAdminPayoutsUseCase {
  execute(filters: PayoutFilterParams): Promise<PaginatedPayouts>;
}
