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
    const { doctorId, startDate, days, future } = params;
    let start = new Date(startDate);
    if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      start = new Date(`${startDate}T00:00:00+05:30`);
    }
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    const slots = await this._getSlotsUsecase.execute({
      doctorId,
      startDate,
      endDate: end.toISOString(),
      excludePast: future,
      practiceLocationId: params.practiceLocationId,
      mode: params.mode,
      status: params.status,
    });
    const grouped: groupedSlotsByLocationAndDateDTO = {};
    for (const slot of slots) {
      const locationId = slot.practiceLocationId;
      const slotDate = new Date(slot.start).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }); // YYYY-MM-DD

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
