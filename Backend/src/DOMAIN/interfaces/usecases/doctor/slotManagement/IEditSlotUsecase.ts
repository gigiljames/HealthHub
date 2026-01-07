import { slotDTO } from "../../../../../application/DTOs/slotDTO";

export interface IEditSlotUsecase {
  execute(slot: slotDTO): Promise<slotDTO>;
}
