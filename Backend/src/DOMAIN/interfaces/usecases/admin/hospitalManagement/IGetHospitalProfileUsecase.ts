import { GetHospitalProfileResponseDTO } from "../../../../../application/DTOs/admin/hospitalManagementDTO";

export interface IGetHospitalProfileUsecase {
  execute(hospitalId: string): Promise<GetHospitalProfileResponseDTO>;
}
