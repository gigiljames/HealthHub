import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IGetFullCalendarSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetFullCalendarSlotsUsecase";
import {
  getDoctorSlotsGroupedByLocationAndDateDTO,
  groupedSlotsByLocationAndDateDTO,
} from "../../DTOs/slot/slotDTO";

export class GetFullCalendarSlotsUsecase implements IGetFullCalendarSlotsUsecase {
  constructor(private readonly _slotRepository: ISlotRepository) {}
  execute(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO> {
    return this._slotRepository.getDoctorSlotsGroupedByDateAndLocation(params);
  }
}
