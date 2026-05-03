import { IGetFullCalendarSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetFullCalendarSlotsUsecase";
import { IGetSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetSlotsUsecase";
import {
  getDoctorSlotsGroupedByLocationAndDateDTO,
  groupedSlotsByLocationAndDateDTO,
} from "../../DTOs/slot/slotDTO";

export class GetFullCalendarSlotsUsecase implements IGetFullCalendarSlotsUsecase {
  constructor(private readonly _getSlotsUsecase: IGetSlotsUsecase) {}

  async execute(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO> {
    const { doctorId, startDate, days } = params;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    const slots = await this._getSlotsUsecase.execute({
      doctorId,
      startDate,
      endDate: end.toISOString(),
    });
    const grouped: groupedSlotsByLocationAndDateDTO = {};
    for (const slot of slots) {
      const locationId = slot.practiceLocationId;
      const slotDate = new Date(slot.start).toLocaleDateString("en-CA"); // YYYY-MM-DD

      if (!grouped[locationId]) {
        grouped[locationId] = {};
      }
      if (!grouped[locationId][slotDate]) {
        grouped[locationId][slotDate] = [];
      }
      grouped[locationId][slotDate].push(slot);
    }

    return grouped;
  }
}
