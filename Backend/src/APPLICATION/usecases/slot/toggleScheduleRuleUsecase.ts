import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import { IToggleScheduleRuleUsecase } from "../../../domain/interfaces/usecases/slot/IToggleScheduleRuleUsecase";
import { scheduleRuleDTO } from "../../DTOs/scheduleRule/scheduleRuleDTO";
import { ScheduleRuleMapper } from "../../mappers/scheduleRuleMapper";

export class ToggleScheduleRuleUsecase implements IToggleScheduleRuleUsecase {
  constructor(
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
  ) {}

  async execute(id: string): Promise<scheduleRuleDTO> {
    const existing = await this._scheduleRuleRepository.findById(id);
    if (!existing) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SCHEDULE_RULE.NOT_FOUND,
      );
    }
    const updated = await this._scheduleRuleRepository.toggleActive(
      id,
      !existing.isActive,
    );
    if (!updated) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.SOMETHING_WENT_WRONG,
      );
    }
    return ScheduleRuleMapper.toDTOFromEntity(updated);
  }
}
