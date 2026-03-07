import { ChangePasswordRequestDTO } from "../../../../application/DTOs/auth/authDTO";

export interface IChangePasswordUsecase {
  execute(userId: string, data: ChangePasswordRequestDTO): Promise<void>;
}
