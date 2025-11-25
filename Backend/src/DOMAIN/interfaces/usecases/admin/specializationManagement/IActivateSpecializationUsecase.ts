import { changeSpecializationStatusRequestDTO } from "../../../../../application/DTOs/admin/changeSpecializationStatusDTO";

export interface IActivateSpecializationUsecase {
  execute(data: changeSpecializationStatusRequestDTO): Promise<void>;
}
