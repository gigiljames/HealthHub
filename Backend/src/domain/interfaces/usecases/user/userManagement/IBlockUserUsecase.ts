import { ChangeUserStatusRequestDTO } from "../../../../../application/DTOs/user/userManagementDTO";

export interface IBlockUserUsecase {
  execute(data: ChangeUserStatusRequestDTO): Promise<void>;
}
