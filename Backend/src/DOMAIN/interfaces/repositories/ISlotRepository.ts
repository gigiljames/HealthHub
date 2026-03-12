import {
  getDoctorSlotsGroupedByLocationAndDateDTO,
  groupedSlotsByDateAndLocationDTO,
  groupedSlotsByLocationAndDateDTO,
} from "../../../application/DTOs/slot/slotDTO";
import Slot from "../../entities/slot";

export interface ISlotRepository {
  findById(id: string): Promise<Slot | null>;
  deleteById(id: string): Promise<void>;
  findByDoctorId(id: string): Promise<Slot[]>;
  getDoctorSlotsGroupedByLocationAndDate(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO>;
  getDoctorSlotsGroupedByDateAndLocation(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByDateAndLocationDTO>;
  save(slot: Slot): Promise<Slot>;
  lockSlotAtomically(
    slotId: string,
    patientId: string,
    lockExpiry: Date,
    now: Date,
  ): Promise<Slot | null>;
  unlockSlot(slotId: string): Promise<void>;
  markSlotAsBooked(
    slotId: string,
    appointmentId: string,
    session?: any,
  ): Promise<void>;
  releaseExpiredLocks(now: Date): Promise<number>;
}
