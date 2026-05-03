import DoctorProfile, {
  DoctorProfilePopulated,
  DoctorProfileSpecializationPopulated,
} from "../../entities/doctorProfile";
import {
  GetDoctorsRequestDTO,
  GetDoctorsResponseDTO,
} from "../../../application/DTOs/doctor/doctorManagementDTO";
import {
  DemographicRaw,
  SpecializationTrendRaw,
} from "./adminDashboardRepositoryTypes";

export interface IDoctorProfileRepository {
  findByDoctorId(doctorId: string): Promise<DoctorProfile | null>;
  findByDoctorIdSpecializationPopulated(
    doctorId: string,
  ): Promise<DoctorProfileSpecializationPopulated | null>;
  findByDoctorIdPopulated(
    doctorId: string,
  ): Promise<DoctorProfilePopulated | null>;
  save(profile: DoctorProfile): Promise<DoctorProfile>;
  getPublicDoctors(query: GetDoctorsRequestDTO): Promise<GetDoctorsResponseDTO>;
  getGenderDemographics(): Promise<DemographicRaw[]>;
  getAgeDemographics(): Promise<DemographicRaw[]>;
  getSpecializationDistribution(): Promise<SpecializationTrendRaw[]>;
}
