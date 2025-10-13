import Auth from "../../DOMAIN/entities/auth";
import { IAuthDocument } from "../../INFRASTRUCTURE/DB/models/authModel";

export class AuthMapper {
  static toEntityFromDocument(doc: IAuthDocument): Auth {
    return new Auth({
      id: JSON.stringify(doc._id),
      email: doc.email,
      name: doc.name,
      passwordHash: doc.passwordHash,
      googleId: doc.googleId,
      role: doc.role,
      isBlocked: doc.isBlocked,
      isNewUser: doc.isNewUser,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toAuthResponseDTOFromEntity(auth: Auth) {
    return {
      id: auth.id,
      name: auth.name,
      email: auth.email,
      role: auth.role,
      isNewUser: auth.isNewUser,
    };
  }
}
