import { specializationRequestDTO } from "../../../../application/DTOs/specialization/specializationDTO";
import Specialization from "../../../entities/specialization";

export interface IEditSpecializationUsecase {
  execute(data: specializationRequestDTO): Promise<Specialization>;
}
