import { doctorProfileBasicInfoDTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { IDProfileBasicInfoUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileBasicInfoUsecase";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import DoctorProfile from "../../../../domain/entities/doctorProfile";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";
import { specializationModel } from "../../../../infrastructure/DB/models/specializationModel";
import { DoctorProfileModel } from "../../../../infrastructure/DB/models/doctorProfileModel";

export class DProfileBasicInfoUsecase implements IDProfileBasicInfoUsecase {
  constructor(
    private doctorProfileRepository: IDoctorProfileRepository,
    private authRepository: IAuthRepository,
  ) {}

  async execute(
    data: doctorProfileBasicInfoDTO,
    doctorId: string,
  ): Promise<boolean | null> {
    const authUser = await this.authRepository.findById(doctorId);
    if (!authUser) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.DOCTOR.NOT_FOUND,
      );
    }
    if (data.name !== undefined) {
      authUser.name = data.name;
    }
    if (authUser.onboardingStep < 3) {
      authUser.onboardingStep = 3;
    }

    const { name, ...profileData } = data;

    const existingProfile =
      await this.doctorProfileRepository.findByDoctorId(doctorId);

    const doctorCount = await DoctorProfileModel.find({
      specialization: data.specialization,
    }).countDocuments();
    if (doctorCount > 2) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "Doctor limit reached for this specialization",
      );
    }

    if (existingProfile) {
      existingProfile.specialization = data.specialization;
      existingProfile.gender = data.gender;
      existingProfile.dob = data.dob;
      existingProfile.phone = data.phone;
      existingProfile.address = data.address;
      existingProfile.about = data.about;
      await this.doctorProfileRepository.save(existingProfile);
      await this.authRepository.save(authUser);
      return true;
    } else {
      const newProfile = new DoctorProfile({
        doctorId: doctorId,
        ...profileData,
      });
      await this.doctorProfileRepository.save(newProfile);
      await this.authRepository.save(authUser);
      return true;
    }
  }
}
