import {
  GetSpecializationRequestDTO,
  GetSpecializationResponseDTO,
} from "../../../../../application/DTOs/admin/getSpecializationRequestDTO";

export interface IGetSpecializationUsecase {
  execute(
    query: GetSpecializationRequestDTO
  ): Promise<GetSpecializationResponseDTO>;
}
