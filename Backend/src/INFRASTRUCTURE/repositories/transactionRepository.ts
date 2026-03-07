import { Types } from "mongoose";
import Transaction from "../../domain/entities/transaction";
import {
  ITransactionRepository,
  TransactionFilterParams,
  PaginatedTransactions,
} from "../../domain/interfaces/repositories/ITransactionRepository";
import { transactionModel } from "../DB/models/transactionModel";
import { PaymentStatus } from "../../domain/enums/paymentStatus";
import { TransactionDirection } from "../../domain/enums/transactionDirection";
import { TransactionType } from "../../domain/enums/transactionType";
import { TransactionSource } from "../../domain/enums/transactionSource";

export class TransactionRepository implements ITransactionRepository {
  async createTransaction(data: any, session?: any): Promise<Transaction> {
    const [doc] = await transactionModel.create([data], { session });
    return this.mapToDomain(doc);
  }

  async updateStatus(
    transactionId: string,
    status: PaymentStatus,
    session?: any,
  ): Promise<void> {
    await transactionModel.updateOne(
      { _id: new Types.ObjectId(transactionId) },
      { $set: { status } },
      { session },
    );
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    const doc = await transactionModel.findById(transactionId);
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findByGatewayRef(gatewayRef: string): Promise<Transaction | null> {
    const doc = await transactionModel.findOne({ gatewayRef });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findByAppointmentId(
    appointmentId: string,
  ): Promise<Transaction | null> {
    const doc = await transactionModel.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  private buildFilterMatch(
    filters: TransactionFilterParams,
  ): Record<string, any> {
    const match: Record<string, any> = {};

    if (filters.search) {
      // Trying to match object ID string or gatewayRef
      if (Types.ObjectId.isValid(filters.search)) {
        match._id = new Types.ObjectId(filters.search);
      } else {
        match.gatewayRef = { $regex: filters.search, $options: "i" };
      }
    }
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
    pipeline: any[],
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

    const pipeline: any[] = [
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
      { $sort: { createdAt: -1 } },
      {
        $project: {
          wallet: 0,
        },
      },
    ];

    return this.paginate(pipeline, page, limit);
  }

  async getTransactionsByDoctorId(
    doctorId: string,
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const match = this.buildFilterMatch(filters);

    const pipeline: any[] = [
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
      { $sort: { createdAt: -1 } },
      {
        $project: {
          wallet: 0,
        },
      },
    ];

    return this.paginate(pipeline, page, limit);
  }

  async getAllTransactions(
    filters: TransactionFilterParams,
  ): Promise<PaginatedTransactions> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const match = this.buildFilterMatch(filters);

    const pipeline: any[] = [
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
      {
        $lookup: {
          from: "auths",
          localField: "wallet.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          userName: { $arrayElemAt: ["$user.name", 0] },
          userEmail: { $arrayElemAt: ["$user.email", 0] },
        },
      },
      {
        $project: {
          user: 0,
        },
      },
    ];

    return this.paginate(pipeline, page, limit);
  }

  private mapToDomain(doc: any): Transaction {
    return new Transaction({
      id: doc._id.toString(),
      direction: doc.direction as TransactionDirection,
      type: doc.type as TransactionType,
      source: doc.source as TransactionSource,
      amount: doc.amount,
      currency: doc.currency,
      walletId: doc.walletId?.toString() || null,
      gatewayRef: doc.gatewayRef || null,
      status: doc.status as PaymentStatus,
      balanceAfter: doc.balanceAfter ?? null,
      appointmentId: doc.appointmentId?.toString() || null,
      payoutId: doc.payoutId?.toString() || null,
    });
  }
}
