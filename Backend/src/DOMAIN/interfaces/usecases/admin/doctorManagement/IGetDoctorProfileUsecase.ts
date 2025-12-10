import { GetDoctorProfileResponseDTO } from "../../../../../application/DTOs/admin/doctorManagementDTO";

export interface IGetDoctorProfileUsecase {
  execute(doctorId: string): Promise<GetDoctorProfileResponseDTO>;
}
