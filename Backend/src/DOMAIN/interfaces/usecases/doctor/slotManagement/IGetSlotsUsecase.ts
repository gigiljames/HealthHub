import { slotDTO } from "../../../../../application/DTOs/slotDTO";

export interface IGetSlotsUsecase {
  execute(doctorId: string): Promise<slotDTO[]>;
}
