import { slotDTO } from "../../../../application/DTOs/slot/slotDTO";

export interface IEditSlotUsecase {
  execute(slot: slotDTO): Promise<slotDTO>;
}
