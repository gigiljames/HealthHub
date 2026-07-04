import {
  getSlotsRequestDTO,
  slotDTO,
} from "../../../../application/DTOs/slot/slotDTO";

export interface IGetSlotsUsecase {
  execute(params: getSlotsRequestDTO): Promise<slotDTO[]>;
}
