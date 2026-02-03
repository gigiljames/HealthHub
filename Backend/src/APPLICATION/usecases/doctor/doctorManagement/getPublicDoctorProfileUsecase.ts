import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { ISlotRepository } from "../../../../domain/interfaces/repositories/ISlotRepository";
import { IGetPublicDoctorProfileUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorManagement/IGetPublicDoctorProfileUsecase";
import { GetDoctorPublicProfileDTO } from "../../../DTOs/doctor/doctorManagementDTO";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";

export class GetPublicDoctorProfileUsecase implements IGetPublicDoctorProfileUsecase {
  constructor(
    private _doctorProfileRepository: IDoctorProfileRepository,
    private _slotRepository: ISlotRepository,
    private _s3Service: IS3Service,
  ) {}
  async execute(doctorId: string): Promise<GetDoctorPublicProfileDTO> {
    const populatedDoctorProfile =
      await this._doctorProfileRepository.findByDoctorIdPopulated(doctorId);
    if (!populatedDoctorProfile) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Doctor not found");
    }
    const slots =
      await this._slotRepository.getDoctorSlotsGroupedByLocationAndDate({
        doctorId,
        startDate: new Date().toISOString().split("T")[0],
        days: 3,
      });
    return {
      id: populatedDoctorProfile.doctorId.id!,
      name: populatedDoctorProfile.doctorId.name!,
      specialization: populatedDoctorProfile.specialization?.name!,
      profileImageUrl: populatedDoctorProfile.profileImageUrl
        ? await this._s3Service.getAccessSignedUrl(
            populatedDoctorProfile.profileImageUrl,
          )
        : "",
      bannerImageUrl: populatedDoctorProfile.bannerImageUrl
        ? await this._s3Service.getAccessSignedUrl(
            populatedDoctorProfile.bannerImageUrl,
          )
        : "",
      contactEmail: populatedDoctorProfile.doctorId.email!,
      contactPhone: populatedDoctorProfile.phone!,
      experience: populatedDoctorProfile.experience,
      education: populatedDoctorProfile.education,
      practiceType: populatedDoctorProfile.practiceType!,
      practiceLocations: populatedDoctorProfile.practiceLocations,
      about: populatedDoctorProfile.about ?? "",
      languages: [],
      slots: slots,
      gender: populatedDoctorProfile.gender,
    };
  }
}
