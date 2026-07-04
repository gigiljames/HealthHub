import {
  GetUsersRequestDTO,
  GetUsersResponseDTO,
  UserListItemDTO,
} from "../../../DTOs/user/userManagementDTO";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IGetUsersUsecase } from "../../../../domain/interfaces/usecases/user/userManagement/IGetUsersUsecase";
import { AuthMapper } from "../../../mappers/authMapper";

export class GetUsersUsecase implements IGetUsersUsecase {
  constructor(private readonly _authRepository: IAuthRepository) {}

  async execute(query: GetUsersRequestDTO): Promise<GetUsersResponseDTO> {
    const authUsers = await this._authRepository.findAllUsers(query);
    const totalDocumentCount =
      await this._authRepository.totalUserDocumentCount(query);

    const usersList: UserListItemDTO[] = authUsers.map((authUser) =>
      AuthMapper.toAdminUserListResponseDTOFromEntity(authUser),
    );

    return {
      users: usersList,
      totalDocumentCount,
    };
  }
}
