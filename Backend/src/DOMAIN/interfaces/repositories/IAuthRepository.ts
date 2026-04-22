import Auth from "../../entities/auth";
import { GetUsersRequestDTO } from "../../../application/DTOs/user/userManagementDTO";
import { GetAllDoctorsRequestDTO } from "../../../application/DTOs/doctor/doctorManagementDTO";
import { TimePeriod } from "../../enums/timePeriod";
import { RegistrationTrendRaw } from "./adminDashboardRepositoryTypes";

export interface IAuthRepository {
  findById(id: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  save(auth: Auth): Promise<Auth>;
  findAllDoctors(query: GetAllDoctorsRequestDTO): Promise<Auth[]>;
  totalDoctorDocumentCount(query: GetAllDoctorsRequestDTO): Promise<number>;
  findAllUsers(query: GetUsersRequestDTO): Promise<Auth[]>;
  totalUserDocumentCount(query: GetUsersRequestDTO): Promise<number>;
  countByRole(role: string): Promise<number>;
  getRegistrationTrends(
    startDate: Date,
    endDate: Date,
    period: TimePeriod,
  ): Promise<RegistrationTrendRaw[]>;
  getEarliestRecordDate(): Promise<Date>;
}
