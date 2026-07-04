import { DisputeResponseDTO } from "../../../../application/DTOs/dispute/disputeDTOs";

export interface IUpdateDisputeStatusUseCase {
  execute(
    disputeId: string,
    status: "OPEN" | "UNDER_REVIEW" | "RESOLVED",
    adminId: string,
    resolutionMessage?: string,
  ): Promise<DisputeResponseDTO>;
}
