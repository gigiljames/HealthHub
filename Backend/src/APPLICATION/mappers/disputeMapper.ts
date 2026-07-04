import Dispute from "../../domain/entities/dispute";
import { DisputeResponseDTO } from "../DTOs/dispute/disputeDTOs";

export class DisputeMapper {
  static toResponseDTO(dispute: Dispute): DisputeResponseDTO {
    return {
      id: dispute.id!,
      appointmentId: dispute.appointmentId,
      reporterId: dispute.reporterId,
      reportedUserId: dispute.reportedUserId,
      reason: dispute.reason,
      description: dispute.description,
      evidence: dispute.evidence.map((ev) => ({
        key: ev.key,
        name: ev.name,
        type: ev.type,
      })),
      status: dispute.status,
      resolutionMessage: dispute.resolutionMessage,
      resolvedBy: dispute.resolvedBy,
      resolvedAt: dispute.resolvedAt ? dispute.resolvedAt.toISOString() : null,
      createdAt: dispute.createdAt.toISOString(),
      updatedAt: dispute.updatedAt.toISOString(),
    };
  }
}
