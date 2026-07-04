import {
  PaginatedPayouts,
  PayoutFilterParams,
} from "../../repositories/IPayoutRepository";

export interface IGetDoctorPayoutsUseCase {
  execute(
    doctorId: string,
    filters: PayoutFilterParams,
  ): Promise<PaginatedPayouts>;
}
