import Auth from "../../entities/auth";
import { GetUsersRequestDTO } from "../../../application/DTOs/user/userManagementDTO";
import {
  DoctorListItemDTO,
  GetAllDoctorsRequestDTO,
  GetDoctorsRequestDTO,
} from "../../../application/DTOs/doctor/doctorManagementDTO";

export interface IAuthRepository {
  findById(id: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  save(auth: Auth): Promise<Auth>;
  findAllDoctors(query: GetAllDoctorsRequestDTO): Promise<Auth[]>;
  totalDoctorDocumentCount(query: GetAllDoctorsRequestDTO): Promise<number>;
  findPublicDoctors(query: GetDoctorsRequestDTO): Promise<DoctorListItemDTO[]>;
  totalPublicDoctorCount(query: GetDoctorsRequestDTO): Promise<number>;
  findAllUsers(query: GetUsersRequestDTO): Promise<Auth[]>;
  totalUserDocumentCount(query: GetUsersRequestDTO): Promise<number>;
}
