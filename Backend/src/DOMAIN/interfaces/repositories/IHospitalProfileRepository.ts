import { HospitalProfile } from "../../entities/hospitalProfile";

export interface IHospitalProfileRepository {
  findByHospitalId(hospitalId: string): Promise<HospitalProfile | null>;
  save(profile: HospitalProfile): Promise<void>;
}
