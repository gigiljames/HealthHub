import { slotDTO } from "../../../../application/DTOs/slot/slotDTO";

export interface IGetSlotsUsecase {
  execute(doctorId: string): Promise<slotDTO[]>;
}
