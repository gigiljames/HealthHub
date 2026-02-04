import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IGetFullCalendarSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetFullCalendarSlotsUsecase";
import { getDoctorSlotsGroupedByLocationAndDateDTO } from "../../DTOs/slot/slotDTO";
import { groupedSlotsByLocationAndDateDTO } from "../../DTOs/slot/slotDTO";

export class GetFullCalendarSlotsUsecase implements IGetFullCalendarSlotsUsecase {
  constructor(private slotRepository: ISlotRepository) {}
  execute(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO> {
    return this.slotRepository.getDoctorSlotsGroupedByDateAndLocation(params);
  }
}
