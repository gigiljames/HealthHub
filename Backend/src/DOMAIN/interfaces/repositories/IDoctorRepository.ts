import DoctorProfile, {
  DoctorProfilePopulated,
} from "../../entities/doctorProfile";

export interface IDoctorProfileRepository {
  findByDoctorId(doctorId: string): Promise<DoctorProfile | null>;
  findByDoctorIdPopulated(
    doctorId: string
  ): Promise<DoctorProfilePopulated | null>;
  save(profile: DoctorProfile): Promise<void>;
}
