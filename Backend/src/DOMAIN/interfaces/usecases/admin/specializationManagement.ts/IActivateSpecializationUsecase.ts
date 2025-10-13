import { changeSpecializationStatusRequestDTO } from "../../../../../APPLICATION/DTOs/admin/changeSpecializationStatusDTO";

export interface IActivateSpecializationUsecase {
  execute(data: changeSpecializationStatusRequestDTO): Promise<void>;
}
