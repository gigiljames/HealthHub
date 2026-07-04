import { IGetPayoutDetailsUseCase } from "../../../domain/interfaces/usecases/payout/IGetPayoutDetailsUseCase";
import { IPayoutRepository } from "../../../domain/interfaces/repositories/IPayoutRepository";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { PayoutDetailsDTO } from "../../DTOs/payout/payoutDTO";
import { PayoutMapper } from "../../mappers/payoutMapper";

export class GetPayoutDetailsUseCase implements IGetPayoutDetailsUseCase {
  constructor(private readonly _payoutRepository: IPayoutRepository) {}

  async execute(payoutId: string): Promise<PayoutDetailsDTO> {
    const payoutDetails =
      await this._payoutRepository.getPayoutDetails(payoutId);

    if (!payoutDetails) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.PAYOUT.NOT_FOUND,
      );
    }

    return PayoutMapper.toPayoutDetailsDTO(payoutDetails);
  }
}
