import {
  recurringSlotsRequestDTO,
  slotDTO,
} from "../../../../../application/DTOs/slotDTO";

export interface ICreateRecurringSlotsUsecase {
  execute(data: recurringSlotsRequestDTO, doctorId: string): Promise<slotDTO[]>;
}
