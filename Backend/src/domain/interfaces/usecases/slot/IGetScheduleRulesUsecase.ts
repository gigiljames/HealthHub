import { scheduleRuleDTO } from "../../../../application/DTOs/scheduleRule/scheduleRuleDTO";

export interface IGetScheduleRulesUsecase {
  execute(doctorId: string): Promise<scheduleRuleDTO[]>;
}
