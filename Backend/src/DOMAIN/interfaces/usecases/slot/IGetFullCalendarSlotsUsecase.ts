import {
  getDoctorSlotsGroupedByLocationAndDateDTO,
  groupedSlotsByLocationAndDateDTO,
} from "../../../../application/DTOs/slot/slotDTO";

export interface IGetFullCalendarSlotsUsecase {
  execute(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO>;
}
