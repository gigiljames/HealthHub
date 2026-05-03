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
    const { doctorId, startDate, endDate } = params;
    const startRange = new Date(startDate);
    const endRange = new Date(endDate);
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
      const occurrences = this._rRuleService.generateOccurrences(
        rule.rruleString,
        startRange,
        endRange,
      );
      const [startH, startM] = rule.startHour.split(":").map(Number);
      const [endH, endM] = rule.endHour.split(":").map(Number);
      for (const occurrenceDate of occurrences) {
        const sessionStart = new Date(occurrenceDate);
        sessionStart.setHours(startH, startM, 0, 0);

        const sessionEnd = new Date(occurrenceDate);
        sessionEnd.setHours(endH, endM, 0, 0);

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
              allSlots.push(SlotMapper.toSlotDTOFromEntity(override));
            } else {
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
          currentStart = new Date(currentEnd.getTime() + rule.buffer * 60000);
        }
      }
    }
    const oneOffSlots = concreteSlots.filter((s) => !s.scheduleRuleId);
    for (const slot of oneOffSlots) {
      allSlots.push(SlotMapper.toSlotDTOFromEntity(slot));
    }
    return allSlots.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
  }
}
