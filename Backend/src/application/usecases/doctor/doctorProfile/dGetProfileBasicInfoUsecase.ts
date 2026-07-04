import { doctorProfileBasicInfoDTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { IDGetProfileBasicInfoUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileBasicInfoUsecase";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { DoctorProfileMapper } from "../../../mappers/doctorProfileMapper";

export class DGetProfileBasicInfoUsecase implements IDGetProfileBasicInfoUsecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _authRepository: IAuthRepository,
  ) {}

  async execute(doctorId: string): Promise<doctorProfileBasicInfoDTO | null> {
    const profile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);
    const authUser = await this._authRepository.findById(doctorId);

    if (profile && authUser && authUser.name) {
      return DoctorProfileMapper.toBasicInfoDTO(profile, authUser.name);
    }
    return null;
  }
}
