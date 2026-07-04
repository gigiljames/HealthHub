import { GetUserProfileResponseDTO } from "../../../../../application/DTOs/user/userManagementDTO";

export interface IGetUserProfileUsecase {
  execute(userId: string): Promise<GetUserProfileResponseDTO>;
}
