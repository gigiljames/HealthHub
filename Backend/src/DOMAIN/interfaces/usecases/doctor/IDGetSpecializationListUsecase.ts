import { SpecializationListDTO } from "../../../../application/DTOs/specializationDTO";

export interface IDGetSpecializationListUsecase {
    execute(): Promise<SpecializationListDTO[]>;
}