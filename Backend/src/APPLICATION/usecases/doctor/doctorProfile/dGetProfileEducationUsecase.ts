import { doctorProfileEducationDTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { IDGetProfileEducationUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileEducationUsecase";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { DoctorProfileMapper } from "../../../mappers/doctorProfileMapper";

export class DGetProfileEducationUsecase implements IDGetProfileEducationUsecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) {}

  async execute(doctorId: string): Promise<doctorProfileEducationDTO | null> {
    const profile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);

    if (profile) {
      return DoctorProfileMapper.toEducationDTO(profile);
    }
    return null;
  }
}
