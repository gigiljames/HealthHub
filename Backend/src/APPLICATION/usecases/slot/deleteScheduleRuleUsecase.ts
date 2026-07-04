import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import { IDeleteScheduleRuleUsecase } from "../../../domain/interfaces/usecases/slot/IDeleteScheduleRuleUsecase";

export class DeleteScheduleRuleUsecase implements IDeleteScheduleRuleUsecase {
  constructor(
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
  ) {}

  async execute(id: string): Promise<string> {
    const existing = await this._scheduleRuleRepository.findById(id);
    if (!existing) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SCHEDULE_RULE.NOT_FOUND,
      );
    }
    await this._scheduleRuleRepository.deleteById(id);
    return id;
  }
}
