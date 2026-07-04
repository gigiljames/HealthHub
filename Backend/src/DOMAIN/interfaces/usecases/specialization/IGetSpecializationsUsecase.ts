import {
  GetSpecializationRequestDTO,
  GetSpecializationResponseDTO,
} from "../../../../application/DTOs/specialization/specializationDTO";

export interface IGetSpecializationUsecase {
  execute(
    query: GetSpecializationRequestDTO,
  ): Promise<GetSpecializationResponseDTO>;
}
