import { IGetWalletDetailsUseCase } from "../../../domain/interfaces/usecases/wallet/IGetWalletDetailsUseCase";
import { IWalletRepository } from "../../../domain/interfaces/repositories/IWalletRepository";
import { IUserProfileRepository } from "../../../domain/interfaces/repositories/IUserProfileRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { Roles } from "../../../domain/enums/roles";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { WalletDetailsDTO } from "../../DTOs/wallet/walletDTO";
import { WalletMapper } from "../../mappers/walletMapper";

export class GetWalletDetailsUseCase implements IGetWalletDetailsUseCase {
  constructor(
    private walletRepository: IWalletRepository,
    private userProfileRepository: IUserProfileRepository,
    private doctorProfileRepository: IDoctorProfileRepository,
    private s3Service: IS3Service,
  ) {}

  async execute(walletId: string): Promise<WalletDetailsDTO> {
    const walletDetails =
      await this.walletRepository.getWalletDetails(walletId);

    if (!walletDetails) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.WALLET.NOT_FOUND,
      );
    }

    let profileImageUrl = null;

    if (walletDetails.user && walletDetails.user.role === Roles.USER) {
      const userProfile = await this.userProfileRepository.findByUserId(
        walletDetails.user._id.toString(),
      );
      if (userProfile && userProfile.profileImageUrl) {
        profileImageUrl = await this.s3Service.getAccessSignedUrl(
          userProfile.profileImageUrl,
        );
      }
    } else if (walletDetails.user && walletDetails.user.role === Roles.DOCTOR) {
      const doctorProfile = await this.doctorProfileRepository.findByDoctorId(
        walletDetails.user._id.toString(),
      );
      if (doctorProfile && doctorProfile.profileImageUrl) {
        profileImageUrl = await this.s3Service.getAccessSignedUrl(
          doctorProfile.profileImageUrl,
        );
      }
    }

    return WalletMapper.toWalletDetailsDTO(walletDetails, profileImageUrl);
  }
}
