import { ITransactionRepository } from "../../../domain/interfaces/repositories/ITransactionRepository";
import { IGetTransactionDetailsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetTransactionDetailsUseCase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";

export class GetTransactionDetailsUseCase implements IGetTransactionDetailsUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly authRepository: IAuthRepository,
    private readonly s3Service: IS3Service,
  ) {}

  async execute(transactionId: string): Promise<any> {
    const transaction =
      await this.transactionRepository.getTransactionDetails(transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.user && transaction.user.profileId) {
      // Since the model could be UserProfile or DoctorProfile, auth payload has `role`
      // but getting profile Image is easier via s3 if we just have the profile image key.
      // The repository's `getTransactionDetails` should ideally lookup `userProfile` (or `doctorProfile`)
      // and include `profileImage` key, which we can then map to `profileImageUrl` via s3Service
      if (transaction.user.profileImage) {
        transaction.user.profileImageUrl =
          await this.s3Service.getAccessSignedUrl(
            transaction.user.profileImage,
          );
      }
    }

    return transaction;
  }
}
