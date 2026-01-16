import Auth from "../../entities/auth";
import { GetUsersRequestDTO } from "../../../application/DTOs/user/userManagementDTO";
import { GetDoctorsRequestDTO } from "../../../application/DTOs/doctor/doctorManagementDTO";

export interface IAuthRepository {
  findById(id: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  save(auth: Auth): Promise<Auth>;
  findAllDoctors(query: GetDoctorsRequestDTO): Promise<Auth[]>;
  totalDoctorDocumentCount(query: GetDoctorsRequestDTO): Promise<number>;
  findAllUsers(query: GetUsersRequestDTO): Promise<Auth[]>;
  totalUserDocumentCount(query: GetUsersRequestDTO): Promise<number>;
}
