import {
  GetSpecializationRequestDTO,
  GetSpecializationResponseDTO,
} from "../../../../../APPLICATION/DTOs/admin/getSpecializationRequestDTO";
import { specializationResponseDTO } from "../../../../../APPLICATION/DTOs/admin/specializationDTO";
import Specialization from "../../../../entities/specialization";

export interface IGetSpecializationUsecase {
  execute(
    query: GetSpecializationRequestDTO
  ): Promise<GetSpecializationResponseDTO>;
}
