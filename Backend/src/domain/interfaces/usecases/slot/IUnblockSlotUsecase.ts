import { slotDTO } from "../../../../application/DTOs/slot/slotDTO";

export interface IUnblockSlotUsecase {
  execute(slotId: string): Promise<slotDTO>;
}
