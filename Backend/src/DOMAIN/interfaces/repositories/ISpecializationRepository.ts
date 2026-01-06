import { GetSpecializationRequestDTO } from "../../../application/DTOs/admin/getSpecializationRequestDTO";
import { SpecializationListDTO } from "../../../application/DTOs/specializationDTO";
import Specialization from "../../entities/specialization";

export interface ISpecializationRepository {
  findByName(name: string): Promise<Specialization | null>;
  findById(id: string): Promise<Specialization | null>;
  findAll(query: GetSpecializationRequestDTO): Promise<Specialization[]>;
  getSpecializationList(): Promise<SpecializationListDTO[]>;
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
  save(specialization: Specialization): Promise<void>;
  totalDocumentCount(query: GetSpecializationRequestDTO): Promise<number>;
}
