import { doctorProfileBasicInfoDTO } from "../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDGetProfileBasicInfoUsecase {
  execute(doctorId: string): Promise<doctorProfileBasicInfoDTO | null>;
}
