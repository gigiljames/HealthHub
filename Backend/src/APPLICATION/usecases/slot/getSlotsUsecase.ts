import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import { IDoctorExceptionRepository } from "../../../domain/interfaces/repositories/IDoctorExceptionRepository";
import { IGetSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetSlotsUsecase";
import { getSlotsRequestDTO, slotDTO } from "../../DTOs/slot/slotDTO";
import { SlotMapper } from "../../mappers/slotMapper";
import { IRRuleService } from "../../../domain/interfaces/services/IRRuleService";

export class GetSlotsUsecase implements IGetSlotsUsecase {
  constructor(
    private readonly _slotRepository: ISlotRepository,
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
    private readonly _doctorExceptionRepository: IDoctorExceptionRepository,
    private readonly _rRuleService: IRRuleService,
  ) {}

  async execute(params: getSlotsRequestDTO): Promise<slotDTO[]> {
    const { doctorId, startDate, endDate, excludePast } = params;
    const now = new Date();

    let startRange = new Date(startDate);
    if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      startRange = new Date(`${startDate}T00:00:00+05:30`);
    }

    let endRange = new Date(endDate);
    if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      endRange = new Date(`${endDate}T23:59:59.999+05:30`);
    }

    if (excludePast && startRange < now) {
      startRange = now;
    }

    const [rules, exceptions, concreteSlots] = await Promise.all([
      this._scheduleRuleRepository.findActiveRulesInRange(
        doctorId,
        startRange,
        endRange,
      ),
      this._doctorExceptionRepository.findExceptionsInRange(
        doctorId,
        startRange,
        endRange,
      ),
      this._slotRepository.findConcreteSlotsByDoctorIdInRange(
        doctorId,
        startRange,
        endRange,
      ),
    ]);

    const allSlots: slotDTO[] = [];
    for (const rule of rules) {
      if (!rule.id) continue;
      let ruleStart = startRange;
      if (rule.validFrom > startRange) {
        ruleStart = rule.validFrom;
      }
      let ruleEnd = endRange;
      if (rule.validTo) {
        const validToTime = new Date(rule.validTo);
        validToTime.setUTCHours(23, 59, 59, 999);
        if (validToTime < endRange) {
          ruleEnd = validToTime;
        }
      }

      const occurrences = this._rRuleService.generateOccurrences(
        rule.rruleString,
        ruleStart,
        ruleEnd,
      );
      for (const occurrenceDate of occurrences) {
        const yyyy = occurrenceDate.getUTCFullYear();
        const mm = String(occurrenceDate.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(occurrenceDate.getUTCDate()).padStart(2, "0");

        const sessionStart = new Date(
          `${yyyy}-${mm}-${dd}T${rule.startHour}:00+05:30`,
        );

        const sessionEnd = new Date(
          `${yyyy}-${mm}-${dd}T${rule.endHour}:00+05:30`,
        );

        let currentStart = new Date(sessionStart);

        while (
          currentStart.getTime() + rule.duration * 60000 <=
          sessionEnd.getTime()
        ) {
          const currentEnd = new Date(
            currentStart.getTime() + rule.duration * 60000,
          );
          const isException = exceptions.some(
            (exc) =>
              currentStart < exc.endDatetime && currentEnd > exc.startDatetime,
          );

          if (!isException) {
            const override = concreteSlots.find(
              (s) =>
                s.scheduleRuleId === rule.id &&
                s.start.getTime() === currentStart.getTime(),
            );

            if (override) {
              if (!excludePast || override.start >= now) {
                allSlots.push(SlotMapper.toSlotDTOFromEntity(override));
              }
            } else {
              if (!excludePast || currentStart >= now) {
                allSlots.push(
                  SlotMapper.createVirtualSlotDTO(
                    {
                      id: rule.id,
                      title: rule.title,
                      practiceLocationId: rule.practiceLocationId,
                      mode: rule.mode,
                    },
                    currentStart,
                    currentEnd,
                  ),
                );
              }
            }
          }
          currentStart = new Date(currentEnd.getTime() + rule.buffer * 60000);
        }
      }
    }
    const oneOffSlots = concreteSlots.filter((s) => !s.scheduleRuleId);
    for (const slot of oneOffSlots) {
      if (!excludePast || slot.start >= now) {
        allSlots.push(SlotMapper.toSlotDTOFromEntity(slot));
      }
    }
    return allSlots.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
  }
}
