import { specializationRequestDTO } from "../../../../application/DTOs/specialization/specializationDTO";
import Specialization from "../../../entities/specialization";

export interface IAddSpecializationUsecase {
  execute(data: specializationRequestDTO): Promise<Specialization>;
}
