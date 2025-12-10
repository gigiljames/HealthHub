import { doctorProfileBasicInfoDTO } from "../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDProfileBasicInfoUsecase {
  execute(
    data: doctorProfileBasicInfoDTO,
    doctorId: string
  ): Promise<boolean | null>;
}
