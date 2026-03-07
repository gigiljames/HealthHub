import { IWalletRepository } from "../../domain/interfaces/repositories/IWalletRepository";
import Wallet from "../../domain/entities/wallet";
import { walletModel } from "../DB/models/walletModel";
import { Types } from "mongoose";

export class WalletRepository implements IWalletRepository {
  async createWallet(userId: string, session?: any): Promise<Wallet> {
    const [doc] = await walletModel.create(
      [{ userId: new Types.ObjectId(userId) }],
      { session },
    );
    return this.mapToDomain(doc);
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    const doc = await walletModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async updateBalance(
    walletId: string,
    amount: number,
    session?: any,
  ): Promise<Wallet> {
    const doc = await walletModel.findOneAndUpdate(
      { _id: new Types.ObjectId(walletId) },
      { $inc: { balance: amount } },
      { new: true, session },
    );
    if (!doc) {
      throw new Error("Wallet not found to update balance");
    }
    return this.mapToDomain(doc);
  }

  private mapToDomain(doc: any): Wallet {
    return new Wallet({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      currency: doc.currency,
      balance: doc.balance,
    });
  }
}
