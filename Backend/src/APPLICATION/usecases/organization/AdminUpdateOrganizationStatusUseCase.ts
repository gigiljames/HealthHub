import { IOrganizationRepository } from "../../../domain/interfaces/repositories/IOrganizationRepository";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { IAdminUpdateOrganizationStatusUsecase } from "../../../domain/interfaces/usecases/organization/IAdminUpdateOrganizationStatusUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import mongoose from "mongoose";

export class AdminUpdateOrganizationStatusUseCase implements IAdminUpdateOrganizationStatusUsecase {
  constructor(
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _emailService: IEmailService,
  ) {}

  async execute(
    id: string,
    action: "approve" | "reject" | "block" | "unblock",
    rejectionReason?: string
  ): Promise<void> {
    const organization = await this._organizationRepository.findById(id);
    if (!organization) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Organization not found.");
    }

    if (action === "approve") {
      if (organization.verificationStatus === "VERIFIED") {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Organization is already approved.");
      }

      // Generate a unique 6-character uppercase alphanumeric code
      let code = "";
      let isUnique = false;
      let attempts = 0;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      while (!isUnique && attempts < 100) {
        code = "";
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existingOrg = await this._organizationRepository.findByCode(code);
        if (!existingOrg) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          "Failed to generate a unique organization code. Please try again.",
        );
      }

      organization.verificationStatus = "VERIFIED";
      organization.isVerified = true;
      organization.organizationCode = code;
      organization.rejectionReason = undefined;

      // Update submissionHistory latest PENDING item to VERIFIED
      const history = organization.submissionHistory || [];
      if (history.length > 0) {
        const lastItem = history[history.length - 1];
        if (lastItem.status === "PENDING") {
          lastItem.status = "VERIFIED";
        }
      }

      organization.updatedAt = new Date();

      await this._organizationRepository.save(organization);

      // Send email containing the code
      await this._emailService.sendOrganizationApprovedEmail(
        organization.email,
        organization.name,
        code,
      );
    } else if (action === "reject") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Rejection reason is required.");
      }

      organization.verificationStatus = "REJECTED";
      organization.isVerified = false;
      organization.rejectionReason = rejectionReason;
      organization.organizationCode = undefined;

      // Update submissionHistory latest PENDING item to REJECTED with rejectionReason
      const history = organization.submissionHistory || [];
      if (history.length > 0) {
        const lastItem = history[history.length - 1];
        if (lastItem.status === "PENDING") {
          lastItem.status = "REJECTED";
          lastItem.rejectionReason = rejectionReason;
        }
      }

      organization.updatedAt = new Date();

      await this._organizationRepository.save(organization);

      // Send email with rejection reason
      await this._emailService.sendOrganizationRejectedEmail(
        organization.email,
        organization.name,
        rejectionReason,
      );
    } else if (action === "block" || action === "unblock") {
      const isBlocked = action === "block";
      organization.isBlocked = isBlocked;
      organization.updatedAt = new Date();

      await this._organizationRepository.save(organization);

      // Cascade update to doctor profiles: update matching practice locations
      const orgObjectId = new mongoose.Types.ObjectId(id);
      await DoctorProfileModel.updateMany(
        { "practiceLocations.organizationId": orgObjectId },
        { $set: { "practiceLocations.$[elem].isActive": !isBlocked } },
        { arrayFilters: [{ "elem.organizationId": orgObjectId }] }
      );
    }
  }
}
