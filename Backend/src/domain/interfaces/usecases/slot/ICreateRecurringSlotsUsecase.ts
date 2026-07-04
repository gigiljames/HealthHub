import {
  recurringSlotsRequestDTO,
  slotDTO,
} from "../../../../application/DTOs/slot/slotDTO";

export interface ICreateRecurringSlotsUsecase {
  execute(data: recurringSlotsRequestDTO, doctorId: string): Promise<slotDTO[]>;
}
