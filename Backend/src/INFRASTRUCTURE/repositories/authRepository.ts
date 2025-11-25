import { AuthMapper } from "../../application/mappers/authMapper";
import Auth from "../../domain/entities/auth";
import { IAuthRepository } from "../../domain/interfaces/repositories/IAuthRepository";
import { GetUsersRequestDTO } from "../../application/DTOs/admin/userManagementDTO";
import { Roles } from "../../domain/enums/roles";
import { authModel } from "../DB/models/authModel";

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
        role: auth.role,
        isBlocked: auth.isBlocked,
        isNewUser: auth.isNewUser,
        createdAt: auth.createdAt,
        updatedAt: auth.updatedAt,
      });
      return AuthMapper.toEntityFromDocument(authDoc);
    }
  }

  async findAll(query: GetUsersRequestDTO): Promise<Auth[]> {
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

  async totalDocumentCount(query: GetUsersRequestDTO): Promise<number> {
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
}
