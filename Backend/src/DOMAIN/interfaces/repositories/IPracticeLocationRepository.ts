import { PracticeLocation } from "../../entities/practiceLocation";

export interface IPracticeLocationRepository {
  findById(id: string): Promise<PracticeLocation | null>;
  findAllByDoctorId(doctorId: string): Promise<PracticeLocation[]>;
  deleteById(id: string): Promise<void>;
  save(practiceLocation: PracticeLocation): Promise<PracticeLocation>;
}
