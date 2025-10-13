import { GetSpecializationRequestDTO } from "../../../APPLICATION/DTOs/admin/getSpecializationRequestDTO";
import Specialization from "../../entities/specialization";

export interface ISpecializationRepository {
  findByName(name: string): Promise<Specialization>;
  findById(id: string): Promise<Specialization>;
  findAll(query: GetSpecializationRequestDTO): Promise<Specialization[]>;
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
  save(specialization: Specialization): Promise<void>;
  totalDocumentCount(query: GetSpecializationRequestDTO): Promise<number>;
}
