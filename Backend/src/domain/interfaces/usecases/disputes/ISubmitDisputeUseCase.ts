import { SubmitDisputeDTO, DisputeResponseDTO } from "../../../../application/DTOs/dispute/disputeDTOs";

export interface ISubmitDisputeUseCase {
  execute(
    reporterId: string,
    data: SubmitDisputeDTO,
  ): Promise<DisputeResponseDTO>;
}
