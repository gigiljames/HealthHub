import {
  GetSpecializationRequestDTO,
  GetSpecializationResponseDTO,
} from "../../../DTOs/admin/getSpecializationRequestDTO";
import { ISpecializationRepository } from "../../../../domain/interfaces/repositories/ISpecializationRepository";
import { IGetSpecializationUsecase } from "../../../../domain/interfaces/usecases/admin/specializationManagement.ts/IGetSpecializationsUsecase";
import { SpecializationMapper } from "../../../mappers/specializationMapper";

export class GetSpecializationUsecase implements IGetSpecializationUsecase {
  constructor(private _specializationRepository: ISpecializationRepository) {}

  async execute(
    query: GetSpecializationRequestDTO
  ): Promise<GetSpecializationResponseDTO> {
    const specializations = await this._specializationRepository.findAll(query);
    return {
      specializations: specializations.map((spec) =>
        SpecializationMapper.toSpecializationResponseDTOFromEntity(spec)
      ),
      totalDocumentCount:
        await this._specializationRepository.totalDocumentCount(query),
    };
  }
}
