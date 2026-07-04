import { IUpdateDisputeStatusUseCase } from "../../../domain/interfaces/usecases/disputes/IUpdateDisputeStatusUseCase";
import { IDisputeRepository } from "../../../domain/interfaces/repositories/IDisputeRepository";
import { DisputeResponseDTO } from "../../DTOs/dispute/disputeDTOs";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { DisputeMapper } from "../../mappers/disputeMapper";
import { IEmailService } from "../../../domain/interfaces/services/IEmailService";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { Roles } from "../../../domain/enums/roles";
import { NotificationType } from "../../../domain/enums/notificationType";

export class UpdateDisputeStatusUseCase implements IUpdateDisputeStatusUseCase {
  constructor(
    private readonly _disputeRepository: IDisputeRepository,
    private readonly _emailService: IEmailService,
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
  ) {}

  async execute(
    disputeId: string,
    status: "OPEN" | "UNDER_REVIEW" | "RESOLVED",
    adminId: string,
    resolutionMessage?: string,
  ): Promise<DisputeResponseDTO> {
    const dispute = await this._disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Dispute report not found");
    }

    const currentStatus = dispute.status;

    if (currentStatus === "RESOLVED") {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Resolved disputes cannot be modified.",
      );
    }

    if (status === "OPEN") {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Cannot transition a dispute status back to OPEN.",
      );
    }

    if (currentStatus === "OPEN" && status === "RESOLVED") {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Disputes must go through UNDER_REVIEW before being RESOLVED.",
      );
    }

    if (status === "RESOLVED") {
      if (!resolutionMessage || resolutionMessage.trim().length === 0) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          "Resolution message is required when resolving a dispute.",
        );
      }
      dispute.resolutionMessage = resolutionMessage.trim();
      dispute.resolvedBy = adminId;
      dispute.resolvedAt = new Date();
    }

    dispute.status = status;

    const savedDispute = await this._disputeRepository.save(dispute);

    // Notify the reporter
    try {
      const reporterAuth = await authModel.findById(dispute.reporterId);
      if (reporterAuth) {
        await (this._emailService as any).sendDisputeStatusEmail(
          reporterAuth.email,
          reporterAuth.name,
          savedDispute.id!,
          status,
          status === "RESOLVED" ? resolutionMessage : undefined,
        );

        if (reporterAuth.role === Roles.USER || reporterAuth.role === Roles.DOCTOR) {
          const title = "Dispute Status Updated";
          const message = status === "UNDER_REVIEW"
            ? "Your dispute report is now under review."
            : "Your dispute report has been resolved.";

          await this._createNotificationUseCase.execute({
            userId: reporterAuth._id.toString(),
            role: reporterAuth.role as Roles,
            title,
            message,
            type: NotificationType.SYSTEM,
            referenceId: savedDispute.id!,
          });
        }
      }
    } catch (err) {
      console.error("Failed to send dispute status notifications", err);
    }

    return DisputeMapper.toResponseDTO(savedDispute);
  }
}
