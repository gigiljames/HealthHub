import Slot from "../../../../domain/entities/slot";
import { ISlotRepository } from "../../../../domain/interfaces/repositories/ISlotRepository";
import { ISlotValidationService } from "../../../../domain/interfaces/services/ISlotValidationService";
import { IRRuleService } from "../../../../domain/interfaces/services/IRRuleService";
import { ICreateRecurringSlotsUsecase } from "../../../../domain/interfaces/usecases/doctor/slotManagement/ICreateRecurringSlotsUsecase";
import { getMaxAllowedDate } from "../../../../utils/dateTimeUtil";
import { recurringSlotsRequestDTO, slotDTO } from "../../../DTOs/slotDTO";
import { SlotMapper } from "../../../mappers/slotMapper";

export class CreateRecurringSlotsUsecase
  implements ICreateRecurringSlotsUsecase
{
  constructor(
    private _slotRepository: ISlotRepository,
    private _slotValidationService: ISlotValidationService,
    private _rRuleService: IRRuleService
  ) {}

  async execute(
    data: recurringSlotsRequestDTO,
    doctorId: string
  ): Promise<slotDTO[]> {
    const startDate = new Date(data.start);
    const endDate = new Date(data.end);

    this._slotValidationService.validateTime(startDate, endDate);
    this._slotValidationService.validateDateRange(startDate);

    const duration = endDate.getTime() - startDate.getTime();
    const maxAllowedDate = getMaxAllowedDate();
    const existingSlots = await this._slotRepository.findByDoctorId(doctorId);

    let dates: Date[] = [];
    if (data.recurMode === "this-week") {
      dates = this._rRuleService.generateDailyForWeek(
        startDate,
        maxAllowedDate
      );
    } else if (data.recurMode === "every-this-day") {
      dates = this._rRuleService.generateWeeklyForMonth(
        startDate,
        maxAllowedDate
      );
    } else if (data.recurMode === "this-month") {
      dates = this._rRuleService.generateDailyForMonth(
        startDate,
        maxAllowedDate
      );
    }

    const createdSlots: Slot[] = [];

    if (dates.length > 0) {
      for (const date of dates) {
        const slotStart = new Date(date);
        const slotEnd = new Date(date.getTime() + duration);
        const newSlot = new Slot({
          doctorId: doctorId,
          title: data.title,
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          mode: data.mode,
        });
        if (
          this._slotValidationService.checkRecurringOverlap(
            newSlot,
            existingSlots
          )
        ) {
          continue;
        }

        const savedSlot = await this._slotRepository.save(newSlot);
        createdSlots.push(savedSlot);
        existingSlots.push(savedSlot);
      }
    }
    return SlotMapper.toSlotDTOListFromEntityList(createdSlots);
  }
}
