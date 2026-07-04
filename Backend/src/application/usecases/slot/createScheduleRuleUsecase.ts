import ScheduleRule from "../../../domain/entities/scheduleRule";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import { ICreateScheduleRuleUsecase } from "../../../domain/interfaces/usecases/slot/ICreateScheduleRuleUsecase";
import {
  createScheduleRuleRequestDTO,
  scheduleRuleDTO,
} from "../../DTOs/scheduleRule/scheduleRuleDTO";
import { ScheduleRuleMapper } from "../../mappers/scheduleRuleMapper";
import { rrulestr } from "rrule";

export class CreateScheduleRuleUsecase implements ICreateScheduleRuleUsecase {
  constructor(
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
  ) {}

  async execute(
    data: createScheduleRuleRequestDTO,
    doctorId: string,
  ): Promise<scheduleRuleDTO> {
    try {
      rrulestr(data.rruleString);
    } catch {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SCHEDULE_RULE.INVALID_RRULE,
      );
    }

    if (data.duration <= 0) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SCHEDULE_RULE.INVALID_DURATION,
      );
    }

    const [startH, startM] = data.startHour.split(":").map(Number);
    const [endH, endM] = data.endHour.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (endMinutes <= startMinutes) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SCHEDULE_RULE.INVALID_TIME_WINDOW,
      );
    }

    const validFrom = new Date(data.validFrom);
    const validTo = data.validTo
      ? new Date(data.validTo)
      : new Date("2099-12-31");
    const existingRules =
      await this._scheduleRuleRepository.findActiveRulesInRange(
        doctorId,
        validFrom,
        validTo,
      );

    if (existingRules.length > 0) {
      for (const existing of existingRules) {
        if (
          existing.practiceLocationId === data.practiceLocationId &&
          existing.startHour === data.startHour &&
          existing.endHour === data.endHour
        ) {
          throw new CustomError(
            HttpStatusCodes.CONFLICT,
            MESSAGES.SCHEDULE_RULE.OVERLAPS_WITH_EXISTING_RULE,
          );
        }
      }
    }

    const rule = new ScheduleRule({
      doctorId,
      title: data.title,
      practiceLocationId: data.practiceLocationId,
      mode: data.mode,
      duration: data.duration,
      buffer: data.buffer,
      rruleString: data.rruleString,
      validFrom,
      validTo: data.validTo ? new Date(data.validTo) : null,
      startHour: data.startHour,
      endHour: data.endHour,
      isActive: true,
    });

    const saved = await this._scheduleRuleRepository.save(rule);
    return ScheduleRuleMapper.toDTOFromEntity(saved);
  }
}
