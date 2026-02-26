import { Types } from "mongoose";
import {
  IAppointmentRepository,
  AppointmentFilterParams,
  PaginatedAppointments,
} from "../../domain/interfaces/repositories/IAppointmentRepository";
import Appointment from "../../domain/entities/appointment";
import { appointmentModel } from "../DB/models/appointmentModel";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus";

// Shared helpers
function buildTabMatch(tab: string): Record<string, any> {
  const now = new Date();
  switch (tab) {
    case "UPCOMING":
      return {
        "slot.start": { $gte: now },
        status: {
          $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING_PAYMENT],
        },
      };
    case "PAST":
      return {
        status: {
          $in: [AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW],
        },
      };
    case "CANCELLED":
      return { status: AppointmentStatus.CANCELLED };
    default:
      return {};
  }
}

function buildFilterMatch(
  filters: AppointmentFilterParams,
  searchFields: string[],
): Record<string, any> {
  const match: Record<string, any> = {};

  if (filters.status) match.status = filters.status;
  if (filters.mode) match["slot.mode"] = filters.mode;
  if (filters.paymentStatus) match["payment.status"] = filters.paymentStatus;
  if (filters.doctorId) match.doctorId = new Types.ObjectId(filters.doctorId);

  if (filters.timeRange) {
    const now = new Date();
    let from: Date;
    if (filters.timeRange === "today") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filters.timeRange === "week") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filters.timeRange === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      from = new Date(0);
    }
    match["slot.start"] = { $gte: from };
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
      from: "payments",
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
      foreignField: "userId",
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
  return sort === "oldest" ? { "slot.start": 1 } : { "slot.start": -1 };
}

async function paginate(
  pipeline: any[],
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

export class AppointmentRepository implements IAppointmentRepository {
  async createAppointment(data: any, session?: any): Promise<Appointment> {
    const [doc] = await appointmentModel.create([data], { session });
    return this.mapToDomain(doc);
  }

  async updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
    session?: any,
  ): Promise<void> {
    await appointmentModel.updateOne(
      { _id: appointmentId },
      { $set: { status } },
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
    return docs.map(this.mapToDomain);
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    const doc = await appointmentModel.findById(appointmentId);
    if (!doc) return null;
    return this.mapToDomain(doc);
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
    return docs.map(this.mapToDomain);
  }

  async updatePaymentId(
    appointmentId: string,
    paymentId: string,
    session?: any,
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
    session?: any,
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
    const basePipeline: any[] = [
      { $match: { patientId: new Types.ObjectId(patientId) } },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      LOOKUP_STAGES.payment,
      LOOKUP_STAGES.unwindPayment,
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      {
        $match: {
          ...buildTabMatch(tab),
          // ...buildFilterMatch(filters, [
          //   "doctorProfile.firstName",
          //   "doctorProfile.lastName",
          //   "doctorProfile.specialization",
          // ]),
        },
      },
      { $sort: buildSort(filters.sort) },
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
    const basePipeline: any[] = [
      { $match: { doctorId: new Types.ObjectId(doctorId) } },
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      LOOKUP_STAGES.payment,
      LOOKUP_STAGES.unwindPayment,
      LOOKUP_STAGES.userProfile,
      LOOKUP_STAGES.unwindUserProfile,
      {
        $match: {
          ...buildTabMatch(tab),
          ...buildFilterMatch(filters, [
            "patientProfile.firstName",
            "patientProfile.lastName",
          ]),
        },
      },
      { $sort: buildSort(filters.sort) },
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
    ]);
    return docs[0] ?? null;
  }

  async getAllAppointments(
    tab: string,
    filters: AppointmentFilterParams,
  ): Promise<PaginatedAppointments> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const basePipeline: any[] = [
      LOOKUP_STAGES.slot,
      LOOKUP_STAGES.unwindSlot,
      LOOKUP_STAGES.payment,
      LOOKUP_STAGES.unwindPayment,
      LOOKUP_STAGES.doctorProfile,
      LOOKUP_STAGES.unwindDoctorProfile,
      LOOKUP_STAGES.userProfile,
      LOOKUP_STAGES.unwindUserProfile,
      {
        $match: {
          ...buildTabMatch(tab),
          ...buildFilterMatch(filters, [
            "doctorProfile.firstName",
            "doctorProfile.lastName",
            "patientProfile.firstName",
            "patientProfile.lastName",
            "doctorProfile.specialization",
          ]),
        },
      },
      { $sort: buildSort(filters.sort) },
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
    ]);
    return docs[0] ?? null;
  }

  private mapToDomain(doc: any): Appointment {
    return new Appointment({
      id: doc._id.toString(),
      patientId: doc.patientId.toString(),
      doctorId: doc.doctorId.toString(),
      slotId: doc.slotId.toString(),
      status: doc.status as AppointmentStatus,
      reason: doc.reason,
      paymentId: doc.paymentId?.toString() || null,
      payoutId: doc.payoutId?.toString() || null,
    });
  }
}
