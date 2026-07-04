import {
  createScheduleRuleRequestDTO,
  scheduleRuleDTO,
} from "../../../../application/DTOs/scheduleRule/scheduleRuleDTO";

export interface ICreateScheduleRuleUsecase {
  execute(
    data: createScheduleRuleRequestDTO,
    doctorId: string,
  ): Promise<scheduleRuleDTO>;
}
