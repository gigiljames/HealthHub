import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IGetHospitalsUsecase } from "../../../../domain/interfaces/usecases/admin/hospitalManagement/IGetHospitalsUsecase";
import {
  GetHospitalsRequestDTO,
  GetHospitalsResponseDTO,
  HospitalListItemDTO,
} from "../../../DTOs/admin/hospitalManagementDTO";
import { AuthMapper } from "../../../mappers/authMapper";

export class GetHospitalsUsecase implements IGetHospitalsUsecase {
  constructor(
    private _authRepository: IAuthRepository,
    private _hospitalProfileRepository: IHospitalProfileRepository
  ) {}

  async execute(
    query: GetHospitalsRequestDTO
  ): Promise<GetHospitalsResponseDTO> {
    const authHospitals = await this._authRepository.findAllHospitals(query);
    const totalDocumentCount =
      await this._authRepository.totalHospitalDocumentCount(query);

    const hospitalsList: HospitalListItemDTO[] = authHospitals.map((authUser) =>
      AuthMapper.toAdminUserListResponseDTOFromEntity(authUser)
    );

    return {
      hospitals: hospitalsList,
      totalDocumentCount,
    };
  }
}
