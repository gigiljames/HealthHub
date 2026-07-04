import { slotDTO } from "../../../../application/DTOs/slot/slotDTO";

export interface IBlockSlotUsecase {
  execute(slotId: string): Promise<slotDTO>;
}
