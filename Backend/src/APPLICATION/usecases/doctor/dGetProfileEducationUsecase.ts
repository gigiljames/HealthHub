import { doctorProfileEducationDTO } from "../../DTOs/doctor/doctorProfileDTO";
import { IDGetProfileEducationUsecase } from "../../../domain/interfaces/usecases/doctor/IDGetProfileEducationUsecase";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorRepository";
import { DoctorProfileMapper } from "../../mappers/doctorProfileMapper";

export class DGetProfileEducationUsecase
  implements IDGetProfileEducationUsecase
{
  constructor(private doctorProfileRepository: IDoctorProfileRepository) {}

  async execute(doctorId: string): Promise<doctorProfileEducationDTO | null> {
    const profile = await this.doctorProfileRepository.findByDoctorId(doctorId);

    if (profile) {
      return DoctorProfileMapper.toEducationDTO(profile);
    }
    return null;
  }
}
