import { specializationRequestDTO } from "../../../../../application/DTOs/admin/specializationDTO";

export interface IEditSpecializationUsecase {
  execute(data: specializationRequestDTO): Promise<void>;
}
