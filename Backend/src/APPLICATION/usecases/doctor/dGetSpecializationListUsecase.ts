import { ISpecializationRepository } from "../../../domain/interfaces/repositories/ISpecializationRepository";
import { IDGetSpecializationListUsecase } from "../../../domain/interfaces/usecases/doctor/IDGetSpecializationListUsecase";
import { SpecializationListDTO } from "../../DTOs/specializationDTO";

export class DGetSpecializationListUsecase implements IDGetSpecializationListUsecase {
    constructor(private _specializationRepository: ISpecializationRepository) {}
    
    async execute(): Promise<SpecializationListDTO[]> {
        return this._specializationRepository.getSpecializationList();
    }
}