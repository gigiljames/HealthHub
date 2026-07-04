import { IAuthDocument } from "../../DB/models/authModel";
import Auth from "../../../domain/entities/auth";

export class AuthRepoMapper {
  static toEntityFromDocument(doc: IAuthDocument): Auth {
    return new Auth({
      id: doc._id?.toString(),
      email: doc.email,
      name: doc.name,
      passwordHash: doc.passwordHash,
      googleId: doc.googleId,
      profileId: doc.profileId?.toString(),
      profileModel: doc.profileModel,
      role: doc.role,
      isBlocked: doc.isBlocked,
      isNewUser: doc.isNewUser,
      onboardingStep: doc.onboardingStep,
      isBookingBlocked: doc.isBookingBlocked,
      suspensionStatus: doc.suspensionStatus,
      suspensionStart: doc.suspensionStart,
      suspensionEnd: doc.suspensionEnd,
      suspensionReason: doc.suspensionReason,
      suspendedBy: doc.suspendedBy?.toString() || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
