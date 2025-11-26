import Auth from "../../entities/auth";
import { GetUsersRequestDTO } from "../../../application/DTOs/admin/userManagementDTO";
import { GetDoctorsRequestDTO } from "../../../application/DTOs/admin/doctorManagementDTO";
import { GetHospitalsRequestDTO } from "../../../application/DTOs/admin/hospitalManagementDTO";

export interface IAuthRepository {
  findById(id: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  save(auth: Auth): Promise<Auth>;
  findAll(query: GetUsersRequestDTO): Promise<Auth[]>;
  totalDocumentCount(query: GetUsersRequestDTO): Promise<number>;
  findAllDoctors(query: GetDoctorsRequestDTO): Promise<Auth[]>;
  totalDoctorDocumentCount(query: GetDoctorsRequestDTO): Promise<number>;
  findAllUsers(query: GetUsersRequestDTO): Promise<Auth[]>;
  totalUserDocumentCount(query: GetUsersRequestDTO): Promise<number>;
  findAllHospitals(query: GetHospitalsRequestDTO): Promise<Auth[]>;
  totalHospitalDocumentCount(query: GetHospitalsRequestDTO): Promise<number>;
}
