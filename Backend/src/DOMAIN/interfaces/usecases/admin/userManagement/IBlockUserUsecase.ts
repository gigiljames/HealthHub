import { ChangeUserStatusRequestDTO } from "../../../../../application/DTOs/admin/userManagementDTO";

export interface IBlockUserUsecase {
  execute(data: ChangeUserStatusRequestDTO): Promise<void>;
}
