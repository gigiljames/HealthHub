import { EnforceModerationActionDTO } from "../../../../application/DTOs/dispute/disputeDTOs";

export interface IEnforceModerationActionUseCase {
  execute(data: EnforceModerationActionDTO): Promise<void>;
}
