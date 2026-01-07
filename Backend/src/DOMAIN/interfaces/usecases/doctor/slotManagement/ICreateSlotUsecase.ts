import { slotDTO } from "../../../../../application/DTOs/slotDTO";

export interface ICreateSlotUsecase {
  execute(slot: slotDTO, doctorId: string): Promise<slotDTO>;
}
