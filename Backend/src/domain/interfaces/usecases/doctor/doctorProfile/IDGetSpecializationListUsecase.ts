import { SpecializationListDTO } from "../../../../../application/DTOs/specialization/specializationDTO";

export interface IDGetSpecializationListUsecase {
  execute(): Promise<SpecializationListDTO[]>;
}
