import {
  GetUsersRequestDTO,
  GetUsersResponseDTO,
} from "../../../../../application/DTOs/admin/userManagementDTO";

export interface IGetUsersUsecase {
  execute(query: GetUsersRequestDTO): Promise<GetUsersResponseDTO>;
}
