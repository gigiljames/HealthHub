import Auth from "../../domain/entities/auth";
import { IAuthRepository } from "../../domain/interfaces/repositories/IAuthRepository";
import { GetUsersRequestDTO } from "../../application/DTOs/user/userManagementDTO";
import { Roles } from "../../domain/enums/roles";
import { authModel, IAuthDocument } from "../DB/models/authModel";
import { GetAllDoctorsRequestDTO } from "../../application/DTOs/doctor/doctorManagementDTO";
import { FilterQuery } from "mongoose";
import { BaseRepository } from "./base/BaseRepository";
import { AuthRepoMapper } from "./mappers/authRepoMapper";
import { TimePeriod } from "../../domain/enums/timePeriod";
import { RegistrationTrendRaw } from "../../domain/interfaces/repositories/adminDashboardRepositoryTypes";

export class AuthRepository
  extends BaseRepository<IAuthDocument>
  implements IAuthRepository
{
  constructor() {
    super(authModel);
  }
  async findById(id: string): Promise<Auth | null> {
    const authDoc = await this.findDocumentById(id);
    return authDoc ? AuthRepoMapper.toEntityFromDocument(authDoc) : null;
  }

  async findByEmail(email: string): Promise<Auth | null> {
    const authDoc = await authModel.findOne({ email });
    return authDoc ? AuthRepoMapper.toEntityFromDocument(authDoc) : null;
  }

  async save(auth: Auth): Promise<Auth> {
    if (auth.id) {
      await authModel.findByIdAndUpdate(auth.id, {
        name: auth.name,
        passwordHash: auth.passwordHash,
        profileId: auth.profileId,
        profileModel: auth.profileModel,
        onboardingStep: auth.onboardingStep,
        isBlocked: auth.isBlocked,
        isNewUser: auth.isNewUser,
        isBookingBlocked: auth.isBookingBlocked,
        suspensionStatus: auth.suspensionStatus,
        suspensionStart: auth.suspensionStart,
        suspensionEnd: auth.suspensionEnd,
        suspensionReason: auth.suspensionReason,
        suspendedBy: auth.suspendedBy,
        updatedAt: auth.updatedAt,
      });
      return auth;
    } else {
      const authDoc = await authModel.create({
        name: auth.name,
        email: auth.email,
        passwordHash: auth.passwordHash,
        googleId: auth.googleId,
        profileId: auth.profileId,
        profileModel: auth.profileModel,
        role: auth.role,
        onboardingStep: auth.onboardingStep,
        isBlocked: auth.isBlocked,
        isNewUser: auth.isNewUser,
        isBookingBlocked: auth.isBookingBlocked,
        suspensionStatus: auth.suspensionStatus,
        suspensionStart: auth.suspensionStart,
        suspensionEnd: auth.suspensionEnd,
        suspensionReason: auth.suspensionReason,
        suspendedBy: auth.suspendedBy,
        createdAt: auth.createdAt,
        updatedAt: auth.updatedAt,
      });
      return AuthRepoMapper.toEntityFromDocument(authDoc);
    }
  }

  async findAllUsers(query: GetUsersRequestDTO): Promise<Auth[]> {
    let sortQuery = {};
    if (query.sort === "alpha-asc") {
      sortQuery = { name: 1 };
    } else if (query.sort === "alpha-desc") {
      sortQuery = { name: -1 };
    } else {
      sortQuery = { createdAt: -1 };
    }

    let filterQuery: object = { role: Roles.USER };

    // Apply search filter
    if (query.search) {
      filterQuery = {
        ...filterQuery,
        $or: [
          { name: { $regex: query.search, $options: "i" } },
          { email: { $regex: query.search, $options: "i" } },
        ],
      };
    }

    // Apply boolean filters
    if (query.blocked === true) {
      filterQuery = { ...filterQuery, isBlocked: true };
    }
    if (query.unblocked === true) {
      filterQuery = { ...filterQuery, isBlocked: false };
    }
    if (query.newUser === true) {
      filterQuery = { ...filterQuery, isNewUser: true };
    }

    const authDocs = await authModel
      .find(filterQuery)
      .collation({ locale: "en" })
      .sort(sortQuery)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);

    return authDocs.map((doc) => AuthRepoMapper.toEntityFromDocument(doc));
  }

  async totalUserDocumentCount(query: GetUsersRequestDTO): Promise<number> {
    let filterQuery: object = { role: Roles.USER };

    // Apply search filter
    if (query.search) {
      filterQuery = {
        ...filterQuery,
        $or: [
          { name: { $regex: query.search, $options: "i" } },
          { email: { $regex: query.search, $options: "i" } },
        ],
      };
    }

    // Apply boolean filters
    if (query.blocked === true) {
      filterQuery = { ...filterQuery, isBlocked: true };
    }
    if (query.unblocked === true) {
      filterQuery = { ...filterQuery, isBlocked: false };
    }
    if (query.newUser === true) {
      filterQuery = { ...filterQuery, isNewUser: true };
    }

    return await authModel.find(filterQuery).countDocuments();
  }

  async findAllDoctors(query: GetAllDoctorsRequestDTO): Promise<Auth[]> {
    let filterQuery: FilterQuery<IAuthDocument> = { role: Roles.DOCTOR };
    let sortQuery = {};
    if (query.sort === "name-asc") {
      sortQuery = { name: 1 };
    } else if (query.sort === "name-desc") {
      sortQuery = { name: -1 };
    } else {
      sortQuery = { createdAt: -1 };
    }
    // Apply search filter
    if (query.search) {
      filterQuery = {
        ...filterQuery,
        $or: [
          { name: { $regex: query.search, $options: "i" } },
          { email: { $regex: query.search, $options: "i" } },
        ],
      };
    }

    // Apply boolean filters
    if (query.blocked === true) {
      filterQuery = { ...filterQuery, isBlocked: true };
    }
    if (query.unblocked === true) {
      filterQuery = { ...filterQuery, isBlocked: false };
    }
    if (query.newUser === true) {
      filterQuery = { ...filterQuery, isNewUser: true };
    }

    const authDocs = await authModel
      .find(filterQuery)
      .collation({ locale: "en" })
      .sort(sortQuery)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);

    return authDocs.map((doc) => AuthRepoMapper.toEntityFromDocument(doc));
  }

  async totalDoctorDocumentCount(
    query: GetAllDoctorsRequestDTO,
  ): Promise<number> {
    let filterQuery: FilterQuery<IAuthDocument> = { role: Roles.DOCTOR };

    // Apply search filter
    if (query.search) {
      filterQuery = {
        ...filterQuery,
        $or: [
          { name: { $regex: query.search, $options: "i" } },
          { email: { $regex: query.search, $options: "i" } },
        ],
      };
    }

    // Apply boolean filters
    if (query.blocked === true) {
      filterQuery = { ...filterQuery, isBlocked: true };
    }
    if (query.unblocked === true) {
      filterQuery = { ...filterQuery, isBlocked: false };
    }
    if (query.newUser === true) {
      filterQuery = { ...filterQuery, isNewUser: true };
    }

    return await authModel.find(filterQuery).countDocuments();
  }
  async countByRole(role: string): Promise<number> {
    return await authModel.countDocuments({ role });
  }

  async getEarliestRecordDate(): Promise<Date> {
    const doc = await authModel.findOne().sort({ createdAt: 1 });
    return doc ? doc.createdAt : new Date();
  }

  async getRegistrationTrends(
    startDate: Date,
    endDate: Date,
    period: TimePeriod,
  ): Promise<RegistrationTrendRaw[]> {
    let dateId;
    switch (period) {
      case TimePeriod.DAILY:
        dateId = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" },
        };
        break;
      case TimePeriod.WEEKLY:
        dateId = {
          $dateToString: { format: "%G-W%V", date: "$createdAt", timezone: "Asia/Kolkata" },
        };
        break;
      case TimePeriod.MONTHLY:
        dateId = {
          $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "Asia/Kolkata" },
        };
        break;
      case TimePeriod.YEARLY:
        dateId = {
          $dateToString: { format: "%Y", date: "$createdAt", timezone: "Asia/Kolkata" },
        };
        break;
    }

    return await authModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: dateId,
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          patients: {
            $sum: {
              $cond: [{ $eq: ["$_id.role", Roles.USER] }, "$count", 0],
            },
          },
          doctors: {
            $sum: {
              $cond: [{ $eq: ["$_id.role", Roles.DOCTOR] }, "$count", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}
