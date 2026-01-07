import Slot from "../../entities/slot";

export interface ISlotRepository {
  findById(id: string): Promise<Slot | null>;
  deleteById(id: string): Promise<string>;
  findByDoctorId(id: string): Promise<Slot[]>;
  save(slot: Slot): Promise<Slot>;
}
