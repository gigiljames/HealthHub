import { AuthMapper } from "../../application/mappers/authMapper";
import Auth from "../../domain/entities/auth";
import { IAuthRepository } from "../../domain/interfaces/repositories/IAuthRepository";
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
}
