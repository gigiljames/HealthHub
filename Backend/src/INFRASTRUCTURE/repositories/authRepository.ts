import { AuthMapper } from "../../APPLICATION/mappers/authMapper";
import Auth from "../../DOMAIN/entities/auth";
import { IAuthRepository } from "../../DOMAIN/interfaces/repositories/IAuthRepository";
import { authModel } from "../DB/models/authModel";

export class AuthRepository implements IAuthRepository {
  async findById(id: string): Promise<Auth> {
    const authDoc = await authModel.findById(id);
    if (authDoc) {
      return AuthMapper.toEntityFromDocument(authDoc);
    }
    return null;
  }

  async findByEmail(email: string): Promise<Auth> {
    const authDoc = await authModel.findOne({ email });
    if (authDoc) {
      return AuthMapper.toEntityFromDocument(authDoc);
    }
    return null;
  }

  async save(auth: Auth): Promise<void> {
    if (auth.id) {
      await authModel.findByIdAndUpdate(auth.id, {
        name: auth.name,
        passwordHash: auth.passwordHash,
        isBlocked: auth.isBlocked,
        isNewUser: auth.isNewUser,
        updatedAt: auth.updatedAt,
      });
    } else {
      await authModel.insertOne({
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
    }
  }
}
