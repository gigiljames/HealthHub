import { DisputeDetailsDTO } from "../../../../application/DTOs/dispute/disputeDTOs";

export interface IGetDisputeDetailsUseCase {
  execute(disputeId: string): Promise<DisputeDetailsDTO>;
}
