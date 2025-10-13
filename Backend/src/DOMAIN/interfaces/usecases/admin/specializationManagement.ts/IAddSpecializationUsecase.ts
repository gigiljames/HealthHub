import {
  specializationRequestDTO,
  specializationResponseDTO,
} from "../../../../../APPLICATION/DTOs/admin/specializationDTO";

export interface IAddSpecializationUsecase {
  execute(data: specializationRequestDTO): Promise<specializationResponseDTO>;
}
