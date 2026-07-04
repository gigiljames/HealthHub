import { GetDoctorProfileResponseDTO } from "../../../../../application/DTOs/doctor/doctorManagementDTO";

export interface IGetDoctorProfileUsecase {
  execute(doctorId: string): Promise<GetDoctorProfileResponseDTO>;
}
