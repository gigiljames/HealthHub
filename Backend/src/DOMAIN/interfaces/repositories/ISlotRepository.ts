import {
  getDoctorSlotsGroupedByLocationAndDateDTO,
  groupedSlotsByLocationAndDateDTO,
} from "../../../application/DTOs/slot/slotDTO";
import Slot from "../../entities/slot";

export interface ISlotRepository {
  findById(id: string): Promise<Slot | null>;
  deleteById(id: string): Promise<string>;
  findByDoctorId(id: string): Promise<Slot[]>;
  getDoctorSlotsGroupedByLocationAndDate(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO>;
  save(slot: Slot): Promise<Slot>;
}
