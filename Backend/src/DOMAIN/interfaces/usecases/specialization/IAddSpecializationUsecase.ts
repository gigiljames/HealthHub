import { specializationRequestDTO } from "../../../../application/DTOs/specialization/specializationDTO";

export interface IAddSpecializationUsecase {
  execute(data: specializationRequestDTO): Promise<void>;
}
