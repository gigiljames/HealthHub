import { ClientSession, FilterQuery, PipelineStage, Types } from "mongoose";
import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../domain/interfaces/repositories/IAppointmentRepository";
import { DemographicRaw, AppointmentTrendRaw } from "../../domain/interfaces/repositories/adminDashboardRepositoryTypes";
import { DoctorAnalysisRawAgg, DoctorDayExecutionAppointmentAgg } from "../../domain/types/repositoryTypes";
import Appointment from "../../domain/entities/appointment";
import {
  appointmentModel,
  IAppointmentDocument,
} from "../DB/models/appointmentModel";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus";
import { BaseRepository } from "./base/BaseRepository";
import { AppointmentRepoMapper } from "./mappers/appointmentRepoMapper";

// Shared helpers
function buildTabMatch(tab: string): Record<string, any> {
  const now = new Date();
  switch (tab) {
    case "UPCOMING":
      return {
        "slot.start": { $gte: now },
        // status: {
        //   $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING_PAYMENT],
        // },
      };
    case "PAST":
      return {
        "slot.start": { $lte: now },
        // status: {
        //   $in: [AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW],
        // },
      };
    case "COMPLETED":
      return {
        status: {
          $in: [AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW],
        },
      };
    case "CANCELLED":
      return {
        status: {
          $in: [
            AppointmentStatus.CANCELLED,
            AppointmentStatus.CANCELLED_BY_USER,
            AppointmentStatus.CANCELLED_BY_DOCTOR,
          ],
        },
      };
    default:
      return {};
  }
}

function buildFilterMatch(
  filters: AppointmentFilterParams,
  searchFields: string[],
): Record<string, any> {
  const match: FilterQuery<IAppointmentDocument> = {};
  if (filters.status) match.status = filters.status;
  if (filters.status === "CANCELLED") {
    match.status = {
      $in: [
        AppointmentStatus.CANCELLED,
        AppointmentStatus.CANCELLED_BY_USER,
        AppointmentStatus.CANCELLED_BY_DOCTOR,
      ],
    };
  }
  if (filters.mode) match["slot.mode"] = filters.mode;
  if (filters.paymentStatus) match["payment.status"] = filters.paymentStatus;
  if (filters.doctorId) match.doctorId = new Types.ObjectId(filters.doctorId);

  if (filters.timeRange) {
    const now = new Date();
    let from: Date;
    let to: Date | null = null;
    if (filters.timeRange === "today") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (filters.timeRange === "week") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filters.timeRange === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      from = new Date(0);
    }
    match["slot.start"] = to ? { $gte: from, $lt: to } : { $gte: from };
  } else if (filters.startDate || filters.endDate) {
    const dateQuery: Record<string, any> = {};
    if (filters.startDate)
      dateQuery.$gte = new Date(filters.startDate as string);
    if (filters.endDate) {
      const end = new Date(filters.endDate as string);
      end.setHours(23, 59, 59, 999);
      dateQuery.$lte = end;
    }
    match["slot.start"] = dateQuery;
  }

  if (filters.search) {
    const regex = { $regex: filters.search, $options: "i" };
    match.$or = searchFields.map((f) => ({ [f]: regex }));
  }

  return match;
}

const LOOKUP_STAGES = {
  slot: {
    $lookup: {
      from: "slots",
      localField: "slotId",
      foreignField: "_id",
      as: "slot",
    },
  },
  unwindSlot: { $unwind: { path: "$slot", preserveNullAndEmptyArrays: false } },
  payment: {
    $lookup: {
      from: "transactions",
      localField: "paymentId",
      foreignField: "_id",
      as: "payment",
    },
  },
  unwindPayment: {
    $unwind: { path: "$payment", preserveNullAndEmptyArrays: true },
  },
  doctorProfile: {
    $lookup: {
      from: "doctorprofiles",
      localField: "doctorId",
      foreignField: "doctorId",
      as: "doctorProfile",
    },
  },
  unwindDoctorProfile: {
    $unwind: { path: "$doctorProfile", preserveNullAndEmptyArrays: true },
  },
  userProfile: {
    $lookup: {
      from: "userprofiles",
      localField: "patientId",
      foreignField: "userId",
      as: "patientProfile",
    },
  },
  unwindUserProfile: {
    $unwind: { path: "$patientProfile", preserveNullAndEmptyArrays: true },
  },
};

function buildSort(sort?: string): Record<string, 1 | -1> {
  if (sort === "appointment-asc") return { "slot.start": 1 };
  if (sort === "appointment-desc") return { "slot.start": -1 };
  if (sort === "booking-asc") return { createdAt: 1 };
  if (sort === "booking-desc") return { createdAt: -1 };
  if (sort === "amount-asc") return { "payment.amount": 1 };
  if (sort === "amount-desc") return { "payment.amount": -1 };
  return sort === "oldest" ? { "slot.start": 1 } : { "slot.start": -1 };
}

async function paginate(
  pipeline: PipelineStage[],
  page: number,
  limit: number,
): Promise<PaginatedAppointments> {
  const skip = (page - 1) * limit;
  const [countResult, docs] = await Promise.all([
    appointmentModel.aggregate([...pipeline, { $count: "total" }]),
    appointmentModel.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit },
    ]),
  ]);
  const total = countResult[0]?.total ?? 0;
  return {
    appointments: docs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────────────────────────────────────

export class AppointmentRepository
  extends BaseRepository<IAppointmentDocument>
  implements IAppointmentRepository
{
  constructor() {
    super(appointmentModel);
  }
  async createAppointment(
    data: any,
    session?: ClientSession,
  ): Promise<Appointment> {
    const [doc] = await appointmentModel.create([data], { session });
    return AppointmentRepoMapper.toEntityFromDocument(doc);
  }

  async findActiveAppointmentBySlotId(slotId: string): Promise<Appointment | null> {
    const doc = await appointmentModel.findOne({
      slotId,
      status: {
        $nin: [
          AppointmentStatus.CANCELLED_BY_USER,
          AppointmentStatus.CANCELLED_BY_DOCTOR,
        ],
      },
    });
    if (!doc) return null;
    return AppointmentRepoMapper.toEntityFromDocument(doc);
  }

  async updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
    session?: ClientSession,
  ): Promise<void> {
    await appointmentModel.updateOne(
      { _id: appointmentId },
      { $set: { status } },
      { session },
    );
  }

  async updateStatusAndReason(
    appointmentId: string,
    status: AppointmentStatus,
    reason: string,
    session?: ClientSession,
  ): Promise<void> {
    await appointmentModel.updateOne(
      { _id: appointmentId },
      { $set: { status, cancellationReason: reason } },
      { session },
    );
  }

  async findCompletableAppointmentsWithNoPayout(
    doctorId: string,
  ): Promise<Appointment[]> {
    const docs = await appointmentModel.find({
      doctorId,
      status: AppointmentStatus.COMPLETED,
      payoutId: null,
    });
    return docs.map((doc) => AppointmentRepoMapper.toEntityFromDocument(doc));
  }

  async getEligibleAppointmentsForPayout(
    doctorId: string,
    cutoffDate: Date,
  ): Promise<Appointment[]> {
    const docs = await appointmentModel.aggregate([
      {
        $match: {
          doctorId: new Types.ObjectId(doctorId),
          status: AppointmentStatus.COMPLETED,
          payoutId: null,
        },
      },
      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slotDetails",
        },
      },
      { $unwind: "$slotDetails" },
      { $match: { "slotDetails.end": { $lte: cutoffDate } } },
    ]);
    return docs.map((doc) => AppointmentRepoMapper.toEntityFromDocument(doc));
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    const doc = await this.findDocumentById(appointmentId);
    return doc ? AppointmentRepoMapper.toEntityFromDocument(doc) : null;
  }

  async getAppointmentsForNoShow(cutoffDate: Date): Promise<Appointment[]> {
    const docs = await appointmentModel.aggregate([
      { $match: { status: AppointmentStatus.CONFIRMED } },
      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slotDetails",
        },
      },
      { $unwind: "$slotDetails" },
      { $match: { "slotDetails.end": { $lt: cutoffDate } } },
    ]);
    return docs.map((doc) => AppointmentRepoMapper.toEntityFromDocument(doc));
  }

  async getAppointmentsStartingBetween(
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const docs = await this.model.aggregate([
      {
        $match: {
          status: AppointmentStatus.CONFIRMED,
        },
      },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      {
        $match: {
          "slot.start": { $gte: startDate, $lt: endDate },
        },
      },
      LOOKUP_STAGES.userProfile,
      LOOKUP_STAGES.unwindUserProfile,
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      {
        $lookup: {
          from: "auths",
          localField: "patientId",
          foreignField: "_id",
          as: "patientAuth",
        },
      },
      { $unwind: { path: "$patientAuth", preserveNullAndEmptyArrays: true } },
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
        $project: {
          _id: 1,
          doctorId: 1,
          patientId: 1,
          "slot.start": 1,
          "slot.mode": 1,
          patientName: "$patientAuth.name",
          patientEmail: "$patientAuth.email",
          doctorName: "$doctorAuth.name",
          doctorEmail: "$doctorAuth.email",
        },
      },
    ]);
    return docs;
  }

  async updatePaymentId(
    appointmentId: string,
    paymentId: string,
    session?: ClientSession,
  ): Promise<void> {
    await appointmentModel.updateOne(
      { _id: appointmentId },
      { $set: { paymentId } },
      { session },
    );
  }

  async updatePayoutId(
    appointmentIds: string[],
    payoutId: string,
    session?: ClientSession,
  ): Promise<void> {
    await appointmentModel.updateMany(
      { _id: { $in: appointmentIds } },
      { $set: { payoutId } },
      { session },
    );
  }

  async getPatientAppointments(
    patientId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const basePipeline: PipelineStage[] = [
      { $match: { patientId: new Types.ObjectId(patientId) } },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      LOOKUP_STAGES.payment,
      LOOKUP_STAGES.unwindPayment,
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      {
        $lookup: {
          from: "auths",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorAuth",
        },
      },
      {
        $unwind: { path: "$doctorAuth", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "specializations",
          localField: "doctorProfile.specialization",
          foreignField: "_id",
          as: "doctorSpecialization",
        },
      },
      {
        $unwind: {
          path: "$doctorSpecialization",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "doctorProfile.name": "$doctorAuth.name",
          "doctorProfile.specialization": "$doctorSpecialization.name",
          "doctorProfile.profileImage": "$doctorProfile.profileImageUrl",
        },
      },
      {
        $match: {
          ...buildTabMatch(tab),
          ...buildFilterMatch(filters, [
            "doctorProfile.name",
            "doctorProfile.specialization",
          ]),
        },
      },
      { $sort: buildSort(filters.sort) },
      {
        $project: {
          _id: 1,
          status: 1,
          reason: 1,
          "doctorProfile.name": 1,
          "doctorProfile.profileImageUrl": 1,
          "doctorProfile.specialization": 1,
          "slot.start": 1,
          "slot.mode": 1,
        },
      },
    ];
    return paginate(basePipeline, page, limit);
  }

  async getPatientAppointmentById(
    appointmentId: string,
    patientId: string,
  ): Promise<any | null> {
    const docs = await appointmentModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(appointmentId),
          patientId: new Types.ObjectId(patientId),
        },
      },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      LOOKUP_STAGES.payment,
      LOOKUP_STAGES.unwindPayment,
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      {
        $lookup: {
          from: "auths",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorAuth",
        },
      },
      {
        $unwind: { path: "$doctorAuth", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "specializations",
          localField: "doctorProfile.specialization",
          foreignField: "_id",
          as: "doctorSpecialization",
        },
      },
      {
        $unwind: {
          path: "$doctorSpecialization",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          practiceLocation: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$doctorProfile.practiceLocations", []] },
                  as: "loc",
                  cond: { $eq: ["$$loc._id", "$slot.practiceLocationId"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          reason: 1,
          doctor: {
            id: "$doctorAuth._id",
            name: "$doctorAuth.name",
            specialization: "$doctorSpecialization.name",
            profileImageUrl: "$doctorProfile.profileImageUrl",
            contactPhone: "$doctorProfile.phone",
          },
          slot: {
            start: "$slot.start",
            consultationMode: "$slot.mode",
            consultationFee: "$practiceLocation.consultationFee",
          },
          payment: {
            amount: "$payment.amount",
            status: "$payment.status",
          },
        },
      },
    ]);
    return docs[0] ?? null;
  }

  async getDoctorAppointments(
    doctorId: string,
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const basePipeline: PipelineStage[] = [
      {
        $match: {
          doctorId: new Types.ObjectId(doctorId),
          status: { $ne: AppointmentStatus.PENDING_PAYMENT },
        },
      },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      LOOKUP_STAGES.payment,
      LOOKUP_STAGES.unwindPayment,
      LOOKUP_STAGES.userProfile,
      LOOKUP_STAGES.unwindUserProfile,
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      {
        $lookup: {
          from: "auths",
          localField: "patientId",
          foreignField: "_id",
          as: "patientAuth",
        },
      },
      {
        $unwind: { path: "$patientAuth", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          practiceLocation: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$doctorProfile.practiceLocations", []] },
                  as: "loc",
                  cond: { $eq: ["$$loc._id", "$slot.practiceLocationId"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          ...buildTabMatch(tab),
          ...buildFilterMatch(filters, ["patientAuth.name"]),
        },
      },
      { $sort: buildSort(filters.sort) },
      {
        $project: {
          _id: 0,
          id: "$_id",
          start: "$slot.start",
          end: "$slot.end",
          locationName: "$practiceLocation.name",
          location: "$practiceLocation.location",
          mode: "$slot.mode",
          status: "$status",
          patientName: "$patientAuth.name",
          dob: "$patientProfile.dob",
          gender: "$patientProfile.gender",
          reason: "$reason",
        },
      },
    ];
    return paginate(basePipeline, page, limit);
  }

  async getDoctorAppointmentById(
    appointmentId: string,
    doctorId: string,
  ): Promise<any | null> {
    const docs = await appointmentModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(appointmentId),
          doctorId: new Types.ObjectId(doctorId),
        },
      },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      LOOKUP_STAGES.payment,
      LOOKUP_STAGES.unwindPayment,
      LOOKUP_STAGES.userProfile,
      LOOKUP_STAGES.unwindUserProfile,
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      {
        $lookup: {
          from: "auths",
          localField: "patientId",
          foreignField: "_id",
          as: "patientAuth",
        },
      },
      {
        $unwind: { path: "$patientAuth", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          practiceLocation: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$doctorProfile.practiceLocations", []] },
                  as: "loc",
                  cond: { $eq: ["$$loc._id", "$slot.practiceLocationId"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          patientId: "$patientId",
          start: "$slot.start",
          end: "$slot.end",
          locationName: "$practiceLocation.name",
          location: "$practiceLocation.location",
          mode: "$slot.mode",
          status: "$status",
          reason: "$reason",
          payment: "$payment",
          patientName: "$patientAuth.name",
          dob: "$patientProfile.dob",
          gender: "$patientProfile.gender",
        },
      },
    ]);
    return docs[0] ?? null;
  }

  async getDoctorDayExecutionAppointments(
    doctorId: string,
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<DoctorDayExecutionAppointmentAgg[]> {
    const docs = await appointmentModel.aggregate([
      {
        $match: {
          doctorId: new Types.ObjectId(doctorId),
          status: { $ne: AppointmentStatus.PENDING_PAYMENT },
        },
      },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      {
        $match: {
          "slot.start": { $gte: startOfDay, $lte: endOfDay },
        },
      },
      LOOKUP_STAGES.userProfile,
      LOOKUP_STAGES.unwindUserProfile,
      {
        $lookup: {
          from: "auths",
          localField: "patientId",
          foreignField: "_id",
          as: "patientAuth",
        },
      },
      {
        $unwind: { path: "$patientAuth", preserveNullAndEmptyArrays: true },
      },
      { $sort: { "slot.start": 1 } },
      {
        $project: {
          _id: 0,
          id: "$_id",
          start: "$slot.start",
          end: "$slot.end",
          mode: "$slot.mode",
          status: "$status",
          reason: "$reason",
          patientName: "$patientAuth.name",
          dob: "$patientProfile.dob",
          gender: "$patientProfile.gender",
          bloodGroup: "$patientProfile.bloodGroup",
          profileImageUrl: "$patientProfile.profileImageUrl",
        },
      },
    ]);
    return docs;
  }

  async getAllAppointments(
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const basePipeline: PipelineStage[] = [
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      LOOKUP_STAGES.payment,
      LOOKUP_STAGES.unwindPayment,
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      LOOKUP_STAGES.userProfile,
      LOOKUP_STAGES.unwindUserProfile,
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
          from: "auths",
          localField: "patientId",
          foreignField: "_id",
          as: "patientAuth",
        },
      },
      { $unwind: { path: "$patientAuth", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          appointmentIdStr: { $toString: "$_id" },
          doctorIdStr: { $toString: "$doctorId" },
          patientIdStr: { $toString: "$patientId" },
          transactionIdStr: {
            $ifNull: [
              { $toString: "$payment.gatewayRef" },
              { $toString: "$payment._id" },
            ],
          },
        },
      },
      {
        $match: {
          ...buildTabMatch(tab),
          ...buildFilterMatch(filters, [
            "doctorAuth.name",
            "doctorAuth.email",
            "patientAuth.name",
            "patientAuth.email",
            "appointmentIdStr",
            "doctorIdStr",
            "patientIdStr",
            "transactionIdStr",
          ]),
        },
      },
      { $sort: buildSort(filters.sort) },
      {
        $project: {
          _id: 1,
          id: "$_id",
          status: 1,
          doctorName: "$doctorAuth.name",
          patientName: "$patientAuth.name",
          mode: "$slot.mode",
          appointmentDate: "$slot.start",
          bookingDate: "$createdAt",
          transactionStatus: "$payment.status",
          amount: "$payment.amount",
        },
      },
    ];
    return paginate(basePipeline, page, limit);
  }

  async getAdminAppointmentById(appointmentId: string): Promise<any | null> {
    const docs = await appointmentModel.aggregate([
      { $match: { _id: new Types.ObjectId(appointmentId) } },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      LOOKUP_STAGES.payment,
      LOOKUP_STAGES.unwindPayment,
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      LOOKUP_STAGES.userProfile,
      LOOKUP_STAGES.unwindUserProfile,
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
          from: "auths",
          localField: "patientId",
          foreignField: "_id",
          as: "patientAuth",
        },
      },
      { $unwind: { path: "$patientAuth", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "appointmentId",
          as: "allTransactions",
        },
      },
      {
        $addFields: {
          practiceLocation: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$doctorProfile.practiceLocations", []] },
                  as: "loc",
                  cond: { $eq: ["$$loc._id", "$slot.practiceLocationId"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          id: "$_id",
          status: 1,
          reason: 1,
          createdAt: 1,
          patientFields: {
            name: "$patientAuth.name",
            email: "$patientAuth.email",
            profileImageUrl: "$patientProfile.profileImageUrl",
            id: "$patientId",
          },
          doctorFields: {
            name: "$doctorAuth.name",
            email: "$doctorAuth.email",
            profileImageUrl: "$doctorProfile.profileImageUrl",
            id: "$doctorId",
          },
          slot: {
            start: "$slot.start",
            end: "$slot.end",
            consultationMode: "$slot.mode",
            consultationFee: "$practiceLocation.consultationFee",
            locationName: "$practiceLocation.name",
            location: "$practiceLocation.location",
          },
          payment: {
            amount: "$payment.amount",
            status: "$payment.status",
          },
          allTransactions: 1,
        },
      },
    ]);
    return docs[0] ?? null;
  }

  async getAppointmentStats(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalBooked: number;
    totalCompleted: number;
    totalCancelled: number;
    totalNoShow: number;
    averageDuration: number;
  }> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
        },
      },
      { $unwind: "$slot" },
      {
        $group: {
          _id: null,
          totalBooked: { $sum: 1 },
          totalCompleted: {
            $sum: {
              $cond: [{ $eq: ["$status", AppointmentStatus.COMPLETED] }, 1, 0],
            },
          },
          totalCancelled: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    [
                      AppointmentStatus.CANCELLED,
                      AppointmentStatus.CANCELLED_BY_USER,
                      AppointmentStatus.CANCELLED_BY_DOCTOR,
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalNoShow: {
            $sum: {
              $cond: [{ $eq: ["$status", AppointmentStatus.NO_SHOW] }, 1, 0],
            },
          },
          totalDuration: {
            $sum: {
              $cond: [
                { $eq: ["$status", AppointmentStatus.COMPLETED] },
                {
                  $dateDiff: {
                    startDate: "$slot.start",
                    endDate: "$slot.end",
                    unit: "minute",
                  },
                },
                0,
              ],
            },
          },
        },
      },
    ];

    const result = await appointmentModel.aggregate(pipeline);
    if (!result.length) {
      return {
        totalBooked: 0,
        totalCompleted: 0,
        totalCancelled: 0,
        totalNoShow: 0,
        averageDuration: 0,
      };
    }

    const {
      totalBooked,
      totalCompleted,
      totalCancelled,
      totalNoShow,
      totalDuration,
    } = result[0];
    return {
      totalBooked,
      totalCompleted,
      totalCancelled,
      totalNoShow,
      averageDuration: totalCompleted > 0 ? totalDuration / totalCompleted : 0,
    };
  }

  async getAppointmentTrends(
    startDate: Date,
    endDate: Date,
    period: string,
  ): Promise<AppointmentTrendRaw[]> {
    let dateId: any;
    switch (period) {
      case "daily":
        dateId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "weekly":
        dateId = {
          $concat: [
            { $dateToString: { format: "%G-W", date: "$createdAt" } },
            { $toString: { $isoWeek: "$createdAt" } },
          ],
        };
        break;
      case "monthly":
        dateId = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      case "yearly":
        dateId = { $dateToString: { format: "%Y", date: "$createdAt" } };
        break;
    }

    return await appointmentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: dateId,
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getModeDistribution(): Promise<DemographicRaw[]> {
    return await appointmentModel.aggregate([
      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
        },
      },
      { $unwind: "$slot" },
      {
        $group: {
          _id: "$slot.mode",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          label: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getDoctorAnalysisData(
    doctorId: string,
    locationId: string | null,
    startDate: Date,
    endDate: Date,
    period: string,
  ): Promise<DoctorAnalysisRawAgg | null> {
    const matchStage: any = {
      doctorId: new Types.ObjectId(doctorId),
      createdAt: { $gte: startDate, $lte: endDate },
    };

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
    ];

    if (locationId) {
      pipeline.push({
        $match: {
          "slot.practiceLocationId": new Types.ObjectId(locationId),
        },
      });
    }

    let dateId: any;
    switch (period) {
      case "daily":
        dateId = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } };
        break;
      case "weekly":
        dateId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "monthly":
        dateId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "yearly":
        dateId = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default:
        dateId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    pipeline.push(
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      {
        $addFields: {
          practiceLocation: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$doctorProfile.practiceLocations", []] },
                  as: "loc",
                  cond: { $eq: ["$$loc._id", "$slot.practiceLocationId"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "consultations",
          localField: "_id",
          foreignField: "appointmentId",
          as: "consultation",
        },
      },
      { $unwind: { path: "$consultation", preserveNullAndEmptyArrays: true } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalAppointments: { $sum: 1 },
                totalCompleted: {
                  $sum: { $cond: [{ $eq: ["$status", AppointmentStatus.COMPLETED] }, 1, 0] },
                },
                cancelledByUser: {
                  $sum: { $cond: [{ $eq: ["$status", AppointmentStatus.CANCELLED_BY_USER] }, 1, 0] },
                },
                cancelledByDoctor: {
                  $sum: { $cond: [{ $eq: ["$status", AppointmentStatus.CANCELLED_BY_DOCTOR] }, 1, 0] },
                },
                totalNoShow: {
                  $sum: { $cond: [{ $eq: ["$status", AppointmentStatus.NO_SHOW] }, 1, 0] },
                },
                totalRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", AppointmentStatus.COMPLETED] },
                      { $ifNull: ["$practiceLocation.consultationFee", 0] },
                      0,
                    ],
                  },
                },
                paymentReceived: {
                  $sum: {
                    $cond: [
                      { $ne: [{ $type: "$payoutId" }, "missing"] },
                      { $ifNull: ["$practiceLocation.consultationFee", 0] },
                      0,
                    ],
                  },
                },
                totalDurationMinutes: {
                  $sum: {
                    $cond: [
                      { $and: [{ $ne: ["$consultation", null] }, { $ne: ["$consultation.startedAt", null] }, { $ne: ["$consultation.endedAt", null] }] },
                      {
                        $dateDiff: {
                          startDate: "$consultation.startedAt",
                          endDate: "$consultation.endedAt",
                          unit: "minute",
                        },
                      },
                      0,
                    ],
                  },
                },
                uniquePatients: { $addToSet: "$patientId" },
              },
            },
          ],
          appointmentTrend: [
            {
              $group: {
                _id: dateId,
                total: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          modeDistribution: [
            { $group: { _id: "$slot.mode", count: { $sum: 1 } } }
          ],
          locationDistribution: [
            { $group: { _id: "$practiceLocation.name", count: { $sum: 1 } } }
          ]
        }
      }
    );

    const result = await appointmentModel.aggregate(pipeline);
    return result[0];
  }
}
