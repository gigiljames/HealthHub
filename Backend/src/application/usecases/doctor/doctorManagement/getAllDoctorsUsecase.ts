import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IGetAllDoctorsUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorManagement/IGetAllDoctorsUsecase";
import {
  AllDoctorListItemDTO,
  GetAllDoctorsRequestDTO,
  GetAllDoctorsResponseDTO,
} from "../../../DTOs/doctor/doctorManagementDTO";
import { AuthMapper } from "../../../mappers/authMapper";

export class GetAllDoctorsUsecase implements IGetAllDoctorsUsecase {
  constructor(private readonly _authRepository: IAuthRepository) {}

  async execute(
    query: GetAllDoctorsRequestDTO,
  ): Promise<GetAllDoctorsResponseDTO> {
    const authDoctors = await this._authRepository.findAllDoctors(query);
    const totalDocumentCount =
      await this._authRepository.totalDoctorDocumentCount(query);

    const doctorsList: AllDoctorListItemDTO[] = authDoctors.map((authDoctor) =>
      AuthMapper.toAdminUserListResponseDTOFromEntity(authDoctor),
    );

    return {
      doctors: doctorsList,
      totalDocumentCount,
    };
  }
}
