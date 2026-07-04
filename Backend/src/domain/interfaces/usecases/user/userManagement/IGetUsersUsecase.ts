import {
  GetUsersRequestDTO,
  GetUsersResponseDTO,
} from "../../../../../application/DTOs/user/userManagementDTO";

export interface IGetUsersUsecase {
  execute(query: GetUsersRequestDTO): Promise<GetUsersResponseDTO>;
}
