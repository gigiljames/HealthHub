import {
  specializationRequestDTO,
  specializationResponseDTO,
} from "../../../../../APPLICATION/DTOs/admin/specializationDTO";

export interface IEditSpecializationUsecase {
  execute(data: specializationRequestDTO): Promise<specializationResponseDTO>;
}
