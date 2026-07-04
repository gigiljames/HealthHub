import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IGetTransactionDetailsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetTransactionDetailsUseCase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { TransactionDetailsDTO } from "../../DTOs/transaction/transactionDTO";
import { TransactionMapper } from "../../mappers/transactionMapper";

export class GetTransactionDetailsUseCase implements IGetTransactionDetailsUseCase {
  constructor(
    private readonly _transactionRepository: ITransactionRepository,
    private readonly _authRepository: IAuthRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(transactionId: string): Promise<TransactionDetailsDTO> {
    const transaction =
      await this._transactionRepository.getTransactionDetails(transactionId);

    if (!transaction) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.TRANSACTION.NOT_FOUND,
      );
    }

    if (transaction.user && transaction.user.profileId) {
      if (transaction.user.profileImage) {
        transaction.user.profileImageUrl =
          await this._s3Service.getAccessSignedUrl(
            transaction.user.profileImage,
          );
      }
    }

    return TransactionMapper.toTransactionDetailsDTO(
      transaction,
      transaction.user?.profileImageUrl || null,
    );
  }
}
