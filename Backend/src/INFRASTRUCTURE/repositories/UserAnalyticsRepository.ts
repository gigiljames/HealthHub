import { Types } from "mongoose";
import { BaseRepository } from "./base/BaseRepository";
import {
  appointmentModel,
  IAppointmentDocument,
} from "../DB/models/appointmentModel";
import {
  IUserAnalyticsRepository,
  UserAppointmentAnalyticsData,
} from "../../domain/interfaces/repositories/IUserAnalyticsRepository";
import {
  UserAnalyticsRepoMapper,
  UserAnalyticsAggDoc,
} from "./mappers/UserAnalyticsRepoMapper";

export class UserAnalyticsRepository
  extends BaseRepository<IAppointmentDocument>
  implements IUserAnalyticsRepository
{
  constructor() {
    super(appointmentModel);
  }

  async getUserAppointmentsForAnalytics(
    userId: string
  ): Promise<UserAppointmentAnalyticsData[]> {
    const rawDocs = await appointmentModel.aggregate([
      {
        $match: { patientId: new Types.ObjectId(userId) },
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
          localField: "doctorProfile.specialization",
          foreignField: "_id",
          as: "specialization",
        },
      },
      { $unwind: { path: "$specialization", preserveNullAndEmptyArrays: true } },
    ]);

    const docs = rawDocs as unknown as UserAnalyticsAggDoc[];
    return UserAnalyticsRepoMapper.toAnalyticsDataList(docs);
  }
}
