import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IGetDoctorsUsecase } from "../../../../domain/interfaces/usecases/admin/doctorManagement/IGetDoctorsUsecase";
import {
  DoctorListItemDTO,
  GetDoctorsRequestDTO,
  GetDoctorsResponseDTO,
} from "../../../DTOs/admin/doctorManagementDTO";
import { AuthMapper } from "../../../mappers/authMapper";

export class GetDoctorsUsecase implements IGetDoctorsUsecase {
  constructor(private _authRepository: IAuthRepository) {}

  async execute(query: GetDoctorsRequestDTO): Promise<GetDoctorsResponseDTO> {
    const authDoctors = await this._authRepository.findAll(query);
    const totalDocumentCount = await this._authRepository.totalDocumentCount(
      query
    );

    const doctorsList: DoctorListItemDTO[] = authDoctors.map((authDoctor) =>
      AuthMapper.toAdminUserListResponseDTOFromEntity(authDoctor)
    );

    return {
      doctors: doctorsList,
      totalDocumentCount,
    };
  }
}
