import { IGetPayoutDetailsUseCase } from "../../../domain/interfaces/usecases/payout/IGetPayoutDetailsUseCase";
import { IPayoutRepository } from "../../../domain/interfaces/repositories/IPayoutRepository";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class GetPayoutDetailsUseCase implements IGetPayoutDetailsUseCase {
  constructor(private readonly payoutRepository: IPayoutRepository) {}

  async execute(payoutId: string): Promise<any> {
    const payoutDetails =
      await this.payoutRepository.getPayoutDetails(payoutId);

    if (!payoutDetails) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Payout not found");
    }

    return payoutDetails;
  }
}
