import { GetDoctorPublicProfileDTO } from "../../../../../application/DTOs/doctor/doctorManagementDTO";

export interface IGetPublicDoctorProfileUsecase {
  execute(doctorId: string): Promise<GetDoctorPublicProfileDTO>;
}
