import { changeSpecializationStatusRequestDTO } from "../../../../application/DTOs/specialization/specializationDTO";

export interface IDeactivateSpecializationUsecase {
  execute(data: changeSpecializationStatusRequestDTO): Promise<void>;
}
