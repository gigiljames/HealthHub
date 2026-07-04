import { ChangeUserStatusRequestDTO } from "../../../../../application/DTOs/user/userManagementDTO";

export interface IUnblockUserUsecase {
  execute(data: ChangeUserStatusRequestDTO): Promise<void>;
}
