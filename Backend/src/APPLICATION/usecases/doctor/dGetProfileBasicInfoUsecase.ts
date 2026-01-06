import { doctorProfileBasicInfoDTO } from "../../DTOs/doctor/doctorProfileDTO";
import { IDGetProfileBasicInfoUsecase } from "../../../domain/interfaces/usecases/doctor/IDGetProfileBasicInfoUsecase";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorRepository";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import { DoctorProfileMapper } from "../../mappers/doctorProfileMapper";

export class DGetProfileBasicInfoUsecase
  implements IDGetProfileBasicInfoUsecase
{
  constructor(
    private doctorProfileRepository: IDoctorProfileRepository,
    private authRepository: IAuthRepository
  ) {}

  async execute(doctorId: string): Promise<doctorProfileBasicInfoDTO | null> {
    const profile = await this.doctorProfileRepository.findByDoctorId(doctorId);
    const authUser = await this.authRepository.findById(doctorId);

    if (profile && authUser && authUser.name) {
      return DoctorProfileMapper.toBasicInfoDTO(profile, authUser.name);
    }
    return null;
  }
}
