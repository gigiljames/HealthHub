import { ChangeUserStatusRequestDTO } from "../../../../../application/DTOs/admin/userManagementDTO";

export interface IUnblockUserUsecase {
  execute(data: ChangeUserStatusRequestDTO): Promise<void>;
}
