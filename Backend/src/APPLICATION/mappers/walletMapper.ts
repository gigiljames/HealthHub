import Wallet from "../../domain/entities/wallet";
import { IWalletDocument } from "../../infrastructure/DB/models/walletModel";
import { WalletDetailsDTO } from "../DTOs/wallet/walletDTO";
import { WalletWithUserAgg } from "../../domain/types/repositoryTypes";

export class WalletMapper {
  static toEntityFromDocument(doc: IWalletDocument): Wallet {
    return new Wallet({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      currency: doc.currency,
      balance: doc.balance,
    });
  }

  static toWalletDetailsDTO(
    raw: WalletWithUserAgg,
    profileImageUrl: string | null,
  ): WalletDetailsDTO {
    return {
      ...raw,
      _id: raw._id.toString(),
      user: {
        ...raw.user,
        _id: raw.user._id.toString(),
        profileImageUrl,
      },
    };
  }
}
