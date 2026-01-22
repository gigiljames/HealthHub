import { doctorProfileExperienceDTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { IDGetProfileExperienceUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileExperienceUsecase";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { DoctorProfileMapper } from "../../../mappers/doctorProfileMapper";

export class DGetProfileExperienceUsecase implements IDGetProfileExperienceUsecase {
  constructor(private doctorProfileRepository: IDoctorProfileRepository) {}

  async execute(doctorId: string): Promise<doctorProfileExperienceDTO | null> {
    const profile = await this.doctorProfileRepository.findByDoctorId(doctorId);

    if (profile) {
      return DoctorProfileMapper.toExperienceDTO(profile);
    }
    return null;
  }
}
