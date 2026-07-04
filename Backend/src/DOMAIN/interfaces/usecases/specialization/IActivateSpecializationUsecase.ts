import { changeSpecializationStatusRequestDTO } from "../../../../application/DTOs/specialization/specializationDTO";

export interface IActivateSpecializationUsecase {
  execute(data: changeSpecializationStatusRequestDTO): Promise<void>;
}
