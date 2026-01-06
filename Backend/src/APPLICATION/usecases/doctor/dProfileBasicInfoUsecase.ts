import { doctorProfileBasicInfoDTO } from "../../DTOs/doctor/doctorProfileDTO";
import { IDProfileBasicInfoUsecase } from "../../../domain/interfaces/usecases/doctor/IDProfileBasicInfoUsecase";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorRepository";
import { IAuthRepository } from "../../../domain/interfaces/repositories/IAuthRepository";
import DoctorProfile from "../../../domain/entities/doctorProfile";

export class DProfileBasicInfoUsecase implements IDProfileBasicInfoUsecase {
  constructor(
    private doctorProfileRepository: IDoctorProfileRepository,
    private authRepository: IAuthRepository
  ) {}

  async execute(
    data: doctorProfileBasicInfoDTO,
    doctorId: string
  ): Promise<boolean | null> {
    const authUser = await this.authRepository.findById(doctorId);
    if (authUser) {
      authUser.name = data.name;
      await this.authRepository.save(authUser);
    }

    const { name, ...profileData } = data;

    const existingProfile = await this.doctorProfileRepository.findByDoctorId(
      doctorId
    );

    if (existingProfile) {
      existingProfile.specialization = data.specialization;
      existingProfile.gender = data.gender;
      existingProfile.dob = data.dob;
      existingProfile.phone = data.phone;
      existingProfile.address = data.address;
      await this.doctorProfileRepository.save(existingProfile);
      return true;
    } else {
      const newProfile = new DoctorProfile({
        doctorId: doctorId,
        ...profileData,
      });
      await this.doctorProfileRepository.save(newProfile);
      return true;
    }
  }
}
