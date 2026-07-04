import { ClientSession, FilterQuery, PipelineStage, Types } from "mongoose";
import Transaction from "../../domain/entities/transaction";
import {
  ITransactionRepository,
  TransactionFilterParams,
  PaginatedTransactions,
} from "../../domain/interfaces/repositories/ITransactionRepository";
import { RevenueTrendRaw } from "../../domain/interfaces/repositories/adminDashboardRepositoryTypes";
import {
  transactionModel,
  ITransactionDocument,
} from "../DB/models/transactionModel";
import { PaymentStatus } from "../../domain/enums/paymentStatus";
import { TransactionDirection } from "../../domain/enums/transactionDirection";
import { TransactionType } from "../../domain/enums/transactionType";
import { TransactionSource } from "../../domain/enums/transactionSource";
import { BaseRepository } from "./base/BaseRepository";
import { TransactionMapper } from "../../application/mappers/transactionMapper";
import { TransactionWithUserAgg } from "../../domain/types/repositoryTypes";

export class TransactionRepository
  extends BaseRepository<ITransactionDocument>
  implements ITransactionRepository
{
  constructor() {
    super(transactionModel);
  }
  async createTransaction(
    data: Transaction,
    session?: ClientSession,
  ): Promise<Transaction> {
    const [doc] = await transactionModel.create([data], { session });
    return TransactionMapper.toEntityFromDocument(doc);
  }

  async updateStatus(
    transactionId: string,
    status: PaymentStatus,
    session?: ClientSession,
  ): Promise<void> {
    await transactionModel.updateOne(
      { _id: new Types.ObjectId(transactionId) },
      { $set: { status } },
      { session },
    );
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    const doc = await this.findDocumentById(transactionId);
    return doc ? TransactionMapper.toEntityFromDocument(doc) : null;
  }

  async findByGatewayRef(gatewayRef: string): Promise<Transaction | null> {
    const doc = await transactionModel.findOne({ gatewayRef });
    if (!doc) return null;
    return TransactionMapper.toEntityFromDocument(doc);
  }

  async findByAppointmentId(
    appointmentId: string,
  ): Promise<Transaction | null> {
    const doc = await transactionModel.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
    });
    if (!doc) return null;
    return TransactionMapper.toEntityFromDocument(doc);
  }

  private buildFilterMatch(
    filters: TransactionFilterParams,
  ): Record<string, object> {
    const match: FilterQuery<ITransactionDocument> = {};
    if (filters.source) match.source = TransactionSource[filters.source];
    if (filters.type) match.type = TransactionType[filters.type];
    if (filters.direction)
      match.direction = TransactionDirection[filters.direction];
    if (filters.status) match.status = PaymentStatus[filters.status];

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      match.amount = {};
      if (filters.minAmount !== undefined)
        match.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined)
        match.amount.$lte = filters.maxAmount;
    }

    if (filters.startDate || filters.endDate) {
      match.createdAt = {};
      if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        match.createdAt.$lte = end;
      }
    }

    return match;
  }

  private async paginate(
    pipeline: PipelineStage[],
    page: number,
    limit: number,
  ): Promise<PaginatedTransactions> {
    const skip = (page - 1) * limit;
    const [countResult, docs] = await Promise.all([
      transactionModel.aggregate([...pipeline, { $count: "total" }]),
      transactionModel.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
      ]),
    ]);
    const total = countResult[0]?.total ?? 0;
    return {
      transactions: docs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTransactionsByUserId(
    userId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const match = this.buildFilterMatch(filters);

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "wallets",
          localField: "walletId",
          foreignField: "_id",
          as: "wallet",
        },
      },
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      {
        $match: {
          $or: [
            { "wallet.userId": new Types.ObjectId(userId) },
            // { "appointment.patientId": new Types.ObjectId(userId) },
          ],
        },
      },
      { $match: match },
    ];

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      pipeline.push(
        {
          $addFields: {
            idStr: { $toString: "$_id" },
            apptIdStr: {
              $cond: {
                if: { $ifNull: ["$appointmentId", false] },
                then: { $toString: "$appointmentId" },
                else: "",
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { gatewayRef: searchRegex },
              { idStr: searchRegex },
              { apptIdStr: searchRegex },
            ],
          },
        },
      );
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $project: {
          wallet: 0,
        },
      },
    );

    return this.paginate(pipeline, page, limit);
  }

  async getTransactionsByDoctorId(
    doctorId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const match = this.buildFilterMatch(filters);

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "wallets",
          localField: "walletId",
          foreignField: "_id",
          as: "wallet",
        },
      },
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      {
        $lookup: {
          from: "payouts",
          localField: "payoutId",
          foreignField: "_id",
          as: "payout",
        },
      },
      {
        $match: {
          $or: [
            { "wallet.userId": new Types.ObjectId(doctorId) },
            // { "appointment.doctorId": new Types.ObjectId(doctorId) },
            // { "payout.doctorId": new Types.ObjectId(doctorId) },
          ],
        },
      },
      { $match: match },
    ];

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      pipeline.push(
        {
          $addFields: {
            idStr: { $toString: "$_id" },
            apptIdStr: {
              $cond: {
                if: { $ifNull: ["$appointmentId", false] },
                then: { $toString: "$appointmentId" },
                else: "",
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { gatewayRef: searchRegex },
              { idStr: searchRegex },
              { apptIdStr: searchRegex },
            ],
          },
        },
      );
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $project: {
          wallet: 0,
        },
      },
    );

    return this.paginate(pipeline, page, limit);
  }

  async getAllTransactions(
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const match = this.buildFilterMatch(filters);

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $lookup: {
          from: "auths",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];
    // console.log(filters);

    // Filter by role if provided
    if (filters.role) {
      pipeline.push({
        $match: { "user.role": filters.role },
      });
    }

    // Search logic
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      const searchConditions: FilterQuery<ITransactionDocument>[] = [
        { "user.name": searchRegex },
        { "user.email": searchRegex },
        { gatewayRef: searchRegex },
      ];

      if (Types.ObjectId.isValid(filters.search)) {
        searchConditions.push({ _id: new Types.ObjectId(filters.search) });
        searchConditions.push({ walletId: new Types.ObjectId(filters.search) });
        searchConditions.push({
          appointmentId: new Types.ObjectId(filters.search),
        });
        searchConditions.push({ payoutId: new Types.ObjectId(filters.search) });
        searchConditions.push({ userId: new Types.ObjectId(filters.search) });
      }
      pipeline.push({ $match: { $or: searchConditions } });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $project: {
          "user.password": 0,
        },
      },
    );

    return this.paginate(pipeline, page, limit);
  }

  async getTransactionDetails(
    transactionId: string,
  ): Promise<TransactionWithUserAgg | null> {
    const pipeline: PipelineStage[] = [
      { $match: { _id: new Types.ObjectId(transactionId) } },
      {
        $lookup: {
          from: "auths",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "userprofiles",
          localField: "user.profileId",
          foreignField: "_id",
          as: "userProfile",
        },
      },
      {
        $lookup: {
          from: "doctorprofiles",
          localField: "user.profileId",
          foreignField: "_id",
          as: "doctorProfile",
        },
      },
      {
        $addFields: {
          "user.profileImage": {
            $ifNull: [
              { $arrayElemAt: ["$doctorProfile.profileImage", 0] },
              { $arrayElemAt: ["$userProfile.profileImage", 0] },
            ],
          },
        },
      },
      {
        $project: {
          "user.password": 0,
          userProfile: 0,
          doctorProfile: 0,
        },
      },
    ];

    const result = await transactionModel.aggregate(pipeline);
    return result.length > 0 ? result[0] : null;
  }

  async getWalletTransactions(
    walletId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const match = this.buildFilterMatch(filters);

    match.walletId = new Types.ObjectId(walletId);

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      {
        $lookup: {
          from: "payouts",
          localField: "payoutId",
          foreignField: "_id",
          as: "payout",
        },
      },
      {
        $lookup: {
          from: "wallets",
          localField: "walletId",
          foreignField: "_id",
          as: "wallet",
        },
      },
    ];

    return this.paginate(pipeline, page, limit);
  }
  async getFinancialStats(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalRevenue: number;
    totalUserCount: number;
  }> {
    const revenueResult = await transactionModel.aggregate([
      {
        $match: {
          type: TransactionType.APPOINTMENT_PAYMENT,
          status: PaymentStatus.SUCCESS,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const userCount = await transactionModel
      .distinct("userId", {
        status: PaymentStatus.SUCCESS,
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .then((users) => users.length);

    return {
      totalRevenue: revenueResult[0]?.total ?? 0,
      totalUserCount: userCount,
    };
  }

  async getRevenueTrends(
    startDate: Date,
    endDate: Date,
    period: string,
  ): Promise<RevenueTrendRaw[]> {
    let dateId;
    switch (period) {
      case "daily":
        dateId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } };
        break;
      case "weekly":
        dateId = { $dateToString: { format: "%G-W%V", date: "$createdAt", timezone: "Asia/Kolkata" } };
        break;
      case "monthly":
        dateId = { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "Asia/Kolkata" } };
        break;
      case "yearly":
        dateId = { $dateToString: { format: "%Y", date: "$createdAt", timezone: "Asia/Kolkata" } };
        break;
    }

    return await transactionModel.aggregate([
      {
        $match: {
          type: TransactionType.APPOINTMENT_PAYMENT,
          status: PaymentStatus.SUCCESS,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: dateId,
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}
