import { specializationRequestDTO } from "../../../../../application/DTOs/admin/specializationDTO";

export interface IAddSpecializationUsecase {
  execute(data: specializationRequestDTO): Promise<void>;
}
