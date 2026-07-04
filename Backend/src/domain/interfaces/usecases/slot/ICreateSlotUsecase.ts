import { slotDTO } from "../../../../application/DTOs/slot/slotDTO";

export interface ICreateSlotUsecase {
  execute(slot: slotDTO, doctorId: string): Promise<slotDTO>;
}
