import { changeSpecializationStatusRequestDTO } from "../../../../../APPLICATION/DTOs/admin/changeSpecializationStatusDTO";

export interface IDeactivateSpecializationUsecase {
  execute(data: changeSpecializationStatusRequestDTO): Promise<void>;
}
