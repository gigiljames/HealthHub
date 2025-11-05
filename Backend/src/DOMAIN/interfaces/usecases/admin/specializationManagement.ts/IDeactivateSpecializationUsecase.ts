import { changeSpecializationStatusRequestDTO } from "../../../../../application/DTOs/admin/changeSpecializationStatusDTO";

export interface IDeactivateSpecializationUsecase {
  execute(data: changeSpecializationStatusRequestDTO): Promise<void>;
}
