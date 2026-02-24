import {
  getDoctorSlotsGroupedByLocationAndDateDTO,
  groupedSlotsByLocationAndDateDTO,
} from "../../../../application/DTOs/slot/slotDTO";

export interface IGetDoctorSlotsUsecase {
  execute(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO>;
}
