import { IPracticeLocationRepository } from "../../domain/interfaces/repositories/IPracticeLocationRepository";
import { PracticeLocation } from "../../domain/entities/practiceLocation";

export class PracticeLocationRepository implements IPracticeLocationRepository {
  async findById(id: string): Promise<PracticeLocation | null> {
    throw new Error("Method not implemented.");
  }
  async findAllByDoctorId(doctorId: string): Promise<PracticeLocation[]> {
    throw new Error("Method not implemented.");
  }
  async deleteById(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async save(practiceLocation: PracticeLocation): Promise<PracticeLocation> {
    throw new Error("Method not implemented.");
  }
}
