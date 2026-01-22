import { AuthMapper } from "../../application/mappers/authMapper";
import Auth from "../../domain/entities/auth";
import { IAuthRepository } from "../../domain/interfaces/repositories/IAuthRepository";
import { GetUsersRequestDTO } from "../../application/DTOs/user/userManagementDTO";
import { Roles } from "../../domain/enums/roles";
import { authModel } from "../DB/models/authModel";
import {
  DoctorListItemDTO,
  GetAllDoctorsRequestDTO,
  GetDoctorsRequestDTO,
} from "../../application/DTOs/doctor/doctorManagementDTO";

export class AuthRepository implements IAuthRepository {
  async findById(id: string): Promise<Auth | null> {
    const authDoc = await authModel.findById(id);
    if (authDoc) {
      return AuthMapper.toEntityFromDocument(authDoc);
    }
    return null;
  }

  async findByEmail(email: string): Promise<Auth | null> {
    const authDoc = await authModel.findOne({ email });
    if (authDoc) {
      return AuthMapper.toEntityFromDocument(authDoc);
    }
    return null;
  }

  async save(auth: Auth): Promise<Auth> {
    if (auth.id) {
      await authModel.findByIdAndUpdate(auth.id, {
        name: auth.name,
        passwordHash: auth.passwordHash,
        profileId: auth.profileId,
        profileModel: auth.profileModel,
        isBlocked: auth.isBlocked,
        isNewUser: auth.isNewUser,
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
        isBlocked: auth.isBlocked,
        isNewUser: auth.isNewUser,
        createdAt: auth.createdAt,
        updatedAt: auth.updatedAt,
      });
      return AuthMapper.toEntityFromDocument(authDoc);
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

    return authDocs.map((doc) => AuthMapper.toEntityFromDocument(doc));
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
    let filterQuery: object = { role: Roles.DOCTOR };
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

    return authDocs.map((doc) => AuthMapper.toEntityFromDocument(doc));
  }

  async totalDoctorDocumentCount(
    query: GetAllDoctorsRequestDTO,
  ): Promise<number> {
    let filterQuery: object = { role: Roles.DOCTOR };

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

  async findPublicDoctors(
    query: GetDoctorsRequestDTO,
  ): Promise<DoctorListItemDTO[]> {
    let filterQuery: object = { role: Roles.DOCTOR };
    // sort filter
    let sortQuery = {};
    switch (query.sort) {
      case "name-asc":
        sortQuery = { name: 1 };
        break;
      case "name-desc":
        sortQuery = { name: -1 };
        break;
      case "fee-asc":
        sortQuery = { consultationFee: 1 };
        break;
      case "fee-desc":
        sortQuery = { consultationFee: -1 };
        break;
      case "rating-asc":
        sortQuery = { rating: 1 };
        break;
      case "rating-desc":
        sortQuery = { rating: -1 };
        break;
      case "nearest":
        sortQuery = { location: 1 };
        break;
      default:
        break;
    }
    // search filter
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

    // return authDocs.map((doc) => AuthMapper.toEntityFromDocument(doc));
    return [
      {
        id: "doc_8f3a21c9",
        name: "Dr. Ananya Sharma",
        specialization: "Cardiology",
        consultationFee: 800,
        rating: 4.6,
        nextAvailableDate: "2026-01-20T10:30:00.000Z",
        consultationMode: ["Online", "In-Person"],
        languages: ["English", "Hindi"],
        location: "Bengaluru, Karnataka",
        profileImageUrl: "https://randomuser.me/api/portraits/women/68.jpg",
      },
    ];
  }

  async totalPublicDoctorCount(query: GetDoctorsRequestDTO): Promise<number> {
    return 0;
  }
}
