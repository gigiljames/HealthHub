import Auth from "../../entities/auth";
import { GetUsersRequestDTO } from "../../../application/DTOs/admin/userManagementDTO";

export interface IAuthRepository {
  findById(id: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  save(auth: Auth): Promise<Auth>;
  findAll(query: GetUsersRequestDTO): Promise<Auth[]>;
  totalDocumentCount(query: GetUsersRequestDTO): Promise<number>;
}
