import Auth from "../../entities/auth";
import { GetUsersRequestDTO } from "../../../application/DTOs/admin/userManagementDTO";
import { GetHospitalsRequestDTO } from "../../../application/DTOs/admin/hospitalManagementDTO";

export interface IAuthRepository {
  findById(id: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  save(auth: Auth): Promise<Auth>;
  findAllUsers(query: GetUsersRequestDTO): Promise<Auth[]>;
  totalUserDocumentCount(query: GetUsersRequestDTO): Promise<number>;
  findAllHospitals(query: GetHospitalsRequestDTO): Promise<Auth[]>;
  totalHospitalDocumentCount(query: GetHospitalsRequestDTO): Promise<number>;
}
