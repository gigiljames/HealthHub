import { GetUserProfileResponseDTO } from "../../../../../application/DTOs/admin/userManagementDTO";

export interface IGetUserProfileUsecase {
  execute(userId: string): Promise<GetUserProfileResponseDTO>;
}
