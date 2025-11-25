import {
  GetUsersRequestDTO,
  GetUsersResponseDTO,
  UserListItemDTO,
} from "../../../DTOs/admin/userManagementDTO";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IGetUsersUsecase } from "../../../../domain/interfaces/usecases/admin/userManagement/IGetUsersUsecase";
import { AuthMapper } from "../../../mappers/authMapper";

export class GetUsersUsecase implements IGetUsersUsecase {
  constructor(private _authRepository: IAuthRepository) {}

  async execute(query: GetUsersRequestDTO): Promise<GetUsersResponseDTO> {
    const authUsers = await this._authRepository.findAll(query);
    const totalDocumentCount = await this._authRepository.totalDocumentCount(query);

    const usersList: UserListItemDTO[] = authUsers.map((authUser) =>
      AuthMapper.toAdminUserListResponseDTOFromEntity(authUser)
    );

    return {
      users: usersList,
      totalDocumentCount,
    };
  }
}
