import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import { IEditScheduleRuleUsecase } from "../../../domain/interfaces/usecases/slot/IEditScheduleRuleUsecase";
import {
  editScheduleRuleRequestDTO,
  scheduleRuleDTO,
} from "../../DTOs/scheduleRule/scheduleRuleDTO";
import { ScheduleRuleMapper } from "../../mappers/scheduleRuleMapper";
import { rrulestr } from "rrule";

export class EditScheduleRuleUsecase implements IEditScheduleRuleUsecase {
  constructor(
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
  ) {}

  async execute(data: editScheduleRuleRequestDTO): Promise<scheduleRuleDTO> {
    const existing = await this._scheduleRuleRepository.findById(data.id);
    if (!existing) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SCHEDULE_RULE.NOT_FOUND,
      );
    }

    if (data.rruleString !== undefined) {
      try {
        rrulestr(data.rruleString);
      } catch {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.SCHEDULE_RULE.INVALID_RRULE,
        );
      }
    }

    if (data.duration !== undefined && data.duration <= 0) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SCHEDULE_RULE.INVALID_DURATION,
      );
    }

    const startHour = data.startHour ?? existing.startHour;
    const endHour = data.endHour ?? existing.endHour;
    const [startH, startM] = startHour.split(":").map(Number);
    const [endH, endM] = endHour.split(":").map(Number);
    if (endH * 60 + endM <= startH * 60 + startM) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SCHEDULE_RULE.INVALID_TIME_WINDOW,
      );
    }

    existing.title = data.title ?? existing.title;
    existing.practiceLocationId =
      data.practiceLocationId ?? existing.practiceLocationId;
    existing.mode = data.mode ?? existing.mode;
    existing.duration = data.duration ?? existing.duration;
    existing.buffer = data.buffer ?? existing.buffer;
    existing.rruleString = data.rruleString ?? existing.rruleString;
    existing.validFrom = data.validFrom
      ? new Date(data.validFrom)
      : existing.validFrom;
    existing.validTo =
      data.validTo !== undefined
        ? data.validTo
          ? new Date(data.validTo)
          : null
        : existing.validTo;
    existing.startHour = startHour;
    existing.endHour = endHour;

    const saved = await this._scheduleRuleRepository.save(existing);
    return ScheduleRuleMapper.toDTOFromEntity(saved);
  }
}
