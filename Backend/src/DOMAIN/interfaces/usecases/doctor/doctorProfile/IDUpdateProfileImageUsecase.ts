import { updateProfileImageDTO } from "../../../../../application/DTOs/sharedDTO";

export interface IDUpdateProfileImageUsecase {
  execute(data: updateProfileImageDTO): Promise<void>;
}
