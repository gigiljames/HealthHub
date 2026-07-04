import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import { IGetScheduleRulesUsecase } from "../../../domain/interfaces/usecases/slot/IGetScheduleRulesUsecase";
import { scheduleRuleDTO } from "../../DTOs/scheduleRule/scheduleRuleDTO";
import { ScheduleRuleMapper } from "../../mappers/scheduleRuleMapper";

export class GetScheduleRulesUsecase implements IGetScheduleRulesUsecase {
  constructor(
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
  ) {}

  async execute(doctorId: string): Promise<scheduleRuleDTO[]> {
    if (!doctorId) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.BAD_REQUEST,
      );
    }
    const rules = await this._scheduleRuleRepository.findByDoctorId(doctorId);
    return ScheduleRuleMapper.toDTOListFromEntityList(rules);
  }
}
