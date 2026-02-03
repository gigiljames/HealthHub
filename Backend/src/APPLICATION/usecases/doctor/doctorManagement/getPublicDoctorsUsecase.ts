import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IGetPublicDoctorsUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorManagement/IGetPublicDoctorsUsecase";
import {
  GetDoctorsRequestDTO,
  GetDoctorsResponseDTO,
} from "../../../DTOs/doctor/doctorManagementDTO";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";

export class GetPublicDoctorsUsecase implements IGetPublicDoctorsUsecase {
  constructor(
    private _doctorProfileRepository: IDoctorProfileRepository,
    private _s3Service: IS3Service,
  ) {}

  async execute(query: GetDoctorsRequestDTO): Promise<GetDoctorsResponseDTO> {
    const response =
      await this._doctorProfileRepository.getPublicDoctors(query);
    for (let doctor of response.doctors) {
      doctor.profileImageUrl = doctor.profileImageUrl
        ? await this._s3Service.getAccessSignedUrl(doctor.profileImageUrl)
        : "";
    }
    return response;
  }
}
