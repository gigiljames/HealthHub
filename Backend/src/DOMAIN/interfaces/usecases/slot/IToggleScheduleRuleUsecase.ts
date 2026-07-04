import { scheduleRuleDTO } from "../../../../application/DTOs/scheduleRule/scheduleRuleDTO";

export interface IToggleScheduleRuleUsecase {
  execute(id: string): Promise<scheduleRuleDTO>;
}
