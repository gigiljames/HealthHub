import { specializationRequestDTO } from "../../../../application/DTOs/specialization/specializationDTO";

export interface IEditSpecializationUsecase {
  execute(data: specializationRequestDTO): Promise<void>;
}
