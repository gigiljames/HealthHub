import { slotDTO } from "../../../../application/DTOs/slot/slotDTO";

export interface ILockSlotUsecase {
  execute(slotId: string, patientId: string): Promise<slotDTO>;
}
