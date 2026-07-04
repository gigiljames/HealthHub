import { updateBannerImageDTO } from "../../../../../application/DTOs/doctor/doctorProfileDTO";

export interface IDUpdateBannerImageUsecase {
  execute(data: updateBannerImageDTO): Promise<void>;
}
