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

  async getWallets(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    minBalance?: number;
    maxBalance?: number;
  }): Promise<{ wallets: any[]; totalPages: number; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const matchStage: any = {};
    if (params.minBalance !== undefined || params.maxBalance !== undefined) {
      matchStage.balance = {};
      if (params.minBalance !== undefined)
        matchStage.balance.$gte = params.minBalance;
      if (params.maxBalance !== undefined)
        matchStage.balance.$lte = params.maxBalance;
    }

    const pipeline: any[] = [{ $match: matchStage }];

    // Lookup user details
    pipeline.push({
      $lookup: {
        from: "auths",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Match search and role from populated user
    const userMatchStage: any = {};
    if (params.role) {
      userMatchStage["user.role"] = params.role;
    }
    if (params.search) {
      userMatchStage.$or = [
        { "user.name": { $regex: params.search, $options: "i" } },
        { "user.email": { $regex: params.search, $options: "i" } },
      ];
      if (Types.ObjectId.isValid(params.search)) {
        userMatchStage.$or.push({ _id: new Types.ObjectId(params.search) });
        userMatchStage.$or.push({
          "user._id": new Types.ObjectId(params.search),
        });
      }
    }

    if (Object.keys(userMatchStage).length > 0) {
      pipeline.push({ $match: userMatchStage });
    }

    // Projection
    pipeline.push({
      $project: {
        _id: 1,
        balance: 1,
        currency: 1,
        createdAt: 1,
        updatedAt: 1,
        "user._id": 1,
        "user.name": 1,
        "user.email": 1,
        "user.role": 1,
      },
    });

    // Sorting
    pipeline.push({ $sort: { createdAt: -1 } });

    // Count and Pagination
    const facetPipeline = [
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    pipeline.push(...facetPipeline);

    const result = await walletModel.aggregate(pipeline);

    const wallets = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      wallets,
      totalPages,
      total,
    };
  }

  async getWalletDetails(walletId: string): Promise<any> {
    const pipeline = [
      {
        $match: {
          _id: new Types.ObjectId(walletId),
        },
      },
      {
        $lookup: {
          from: "auths",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          balance: 1,
          currency: 1,
          createdAt: 1,
          updatedAt: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.role": 1,
        },
      },
    ];

    const result = await walletModel.aggregate(pipeline);
    return result[0] || null;
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
