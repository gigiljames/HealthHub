import {
  IPayoutRepository,
  PayoutFilterParams,
  PaginatedPayouts,
} from "../../domain/interfaces/repositories/IPayoutRepository";
import Payout from "../../domain/entities/payout";
import { payoutModel, IPayoutDocument } from "../DB/models/payoutModel";
import { authModel } from "../DB/models/authModel";
import { PayoutStatus } from "../../domain/enums/payoutStatus";
import { Types } from "mongoose";
import { BaseRepository } from "./base/BaseRepository";

export class PayoutRepository
  extends BaseRepository<IPayoutDocument>
  implements IPayoutRepository
{
  constructor() {
    super(payoutModel);
  }
  async createPayoutRecord(data: any, session?: any): Promise<Payout> {
    const [doc] = await payoutModel.create([data], { session });
    return this.mapToDomain(doc);
  }

  async markPayoutProcessed(
    payoutId: string,
    transactionId?: string,
  ): Promise<void> {
    const updateData: any = { status: PayoutStatus.PROCESSED };
    if (transactionId) {
      updateData.transactionId = new Types.ObjectId(transactionId);
    }
    await payoutModel.updateOne({ _id: payoutId }, { $set: updateData });
  }

  async findById(payoutId: string): Promise<Payout | null> {
    const doc = await this.findDocumentById(payoutId);
    return doc ? this.mapToDomain(doc) : null;
  }

  private mapToDomain(doc: any): Payout {
    return new Payout({
      id: doc._id.toString(),
      doctorId: doc.doctorId.toString(),
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status as PayoutStatus,
      transactionId: doc.transactionId?.toString() || null,
      grossAmount: doc.grossAmount,
      platformCommissions: doc.platformCommissions,
      appointmentIds: doc.appointmentIds.map((id: any) => id.toString()),
    });
  }

  async getDoctorPayouts(
    doctorId: string,
    filters: PayoutFilterParams,
  ): Promise<PaginatedPayouts> {
    const {
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = filters;

    const query: any = { doctorId: new Types.ObjectId(doctorId) };

    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortConfig: any = {};
    const order = sortOrder === "desc" ? -1 : 1;

    if (sortBy === "amount") sortConfig.amount = order;
    else if (sortBy === "appointments") sortConfig.appointmentsCount = order;
    else sortConfig.createdAt = order; // default to oldest/newest

    const pipeline: any[] = [
      { $match: query },
      { $addFields: { appointmentsCount: { $size: "$appointmentIds" } } },
    ];

    if (search) {
      // For doctor, search by payout ID or transaction ID
      pipeline.push({
        $match: {
          $or: [
            {
              _id: Types.ObjectId.isValid(search)
                ? new Types.ObjectId(search)
                : null,
            },
            {
              transactionId: Types.ObjectId.isValid(search)
                ? new Types.ObjectId(search)
                : null,
            },
          ],
        },
      });
    }

    pipeline.push({ $sort: sortConfig });

    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await payoutModel.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Lookup transaction details
    pipeline.push({
      $lookup: {
        from: "transactions",
        localField: "transactionId",
        foreignField: "_id",
        as: "transaction",
      },
    });
    pipeline.push({
      $unwind: { path: "$transaction", preserveNullAndEmptyArrays: true },
    });

    const payouts = await payoutModel.aggregate(pipeline);

    return {
      payouts: payouts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdminPayouts(
    filters: PayoutFilterParams,
  ): Promise<PaginatedPayouts> {
    const {
      search,
      status,
      startDate,
      endDate,
      specialization,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = filters;

    const query: any = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortConfig: any = {};
    const order = sortOrder === "desc" ? -1 : 1;

    if (sortBy === "amount") sortConfig.amount = order;
    else if (sortBy === "appointments") sortConfig.appointmentsCount = order;
    else sortConfig.createdAt = order; // default oldest/newest

    const pipeline: any[] = [
      { $match: query },
      { $addFields: { appointmentsCount: { $size: "$appointmentIds" } } },
      {
        $lookup: {
          from: "auths",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorAuth",
        },
      },
      { $unwind: "$doctorAuth" },
      {
        $lookup: {
          from: "doctorprofiles",
          localField: "doctorId",
          foreignField: "doctorId",
          as: "doctorProfile",
        },
      },
      { $unwind: { path: "$doctorProfile", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "specializations",
          localField: "doctorProfile.specialities",
          foreignField: "_id",
          as: "specializations",
        },
      },
    ];

    if (specialization) {
      pipeline.push({
        $match: {
          "specializations.name": { $regex: new RegExp(specialization, "i") },
        },
      });
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            {
              _id: Types.ObjectId.isValid(search)
                ? new Types.ObjectId(search)
                : null,
            },
            {
              transactionId: Types.ObjectId.isValid(search)
                ? new Types.ObjectId(search)
                : null,
            },
            { "doctorAuth.email": searchRegex },
            { "doctorAuth.name": searchRegex },
          ],
        },
      });
    }

    pipeline.push({ $sort: sortConfig });

    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await payoutModel.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Lookup transaction details
    pipeline.push({
      $lookup: {
        from: "transactions",
        localField: "transactionId",
        foreignField: "_id",
        as: "transaction",
      },
    });
    pipeline.push({
      $unwind: { path: "$transaction", preserveNullAndEmptyArrays: true },
    });

    const payouts = await payoutModel.aggregate(pipeline);

    // Format output
    const formattedPayouts = payouts.map((p) => ({
      ...p,
      doctor: {
        id: p.doctorAuth._id,
        name: p.doctorAuth.name,
        email: p.doctorAuth.email,
        phone: p.doctorAuth.phone,
        specialization:
          p.specializations?.map((s: any) => s.name).join(", ") || "",
      },
    }));

    return {
      payouts: formattedPayouts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPayoutDetails(payoutId: string): Promise<any> {
    const pipeline: any[] = [
      { $match: { _id: new Types.ObjectId(payoutId) } },
      {
        $lookup: {
          from: "auths",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorAuth",
        },
      },
      { $unwind: { path: "$doctorAuth", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "doctorprofiles",
          localField: "doctorId",
          foreignField: "doctorId",
          as: "doctorProfile",
        },
      },
      { $unwind: { path: "$doctorProfile", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "specializations",
          localField: "doctorProfile.specialities",
          foreignField: "_id",
          as: "specializations",
        },
      },
      {
        $lookup: {
          from: "transactions",
          localField: "transactionId",
          foreignField: "_id",
          as: "transaction",
        },
      },
      { $unwind: { path: "$transaction", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentIds",
          foreignField: "_id",
          as: "appointments",
        },
      },
    ];

    const result = await payoutModel.aggregate(pipeline);
    if (!result || result.length === 0) return null;

    const p = result[0];

    // Also fetch patient details for each appointment
    const appointmentsWithPatients = await Promise.all(
      p.appointments.map(async (apt: any) => {
        const patientAuth = await authModel
          .findById(apt.patientId)
          .select("name email phone")
          .lean();
        return {
          ...apt,
          patient: patientAuth,
        };
      }),
    );

    return {
      _id: p._id,
      amount: p.amount,
      grossAmount: p.grossAmount,
      platformCommissions: p.platformCommissions,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt,
      doctor: p.doctorAuth
        ? {
            id: p.doctorAuth._id,
            name: p.doctorAuth.name,
            email: p.doctorAuth.email,
            phone: p.doctorAuth.phone,
            specialization:
              p.specializations?.map((s: any) => s.name).join(", ") || "",
          }
        : null,
      transaction: p.transaction
        ? {
            id: p.transaction._id,
            amount: p.transaction.amount,
            status: p.transaction.status,
            createdAt: p.transaction.createdAt,
          }
        : null,
      appointments: appointmentsWithPatients,
    };
  }
}
