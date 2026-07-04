import {
  editScheduleRuleRequestDTO,
  scheduleRuleDTO,
} from "../../../../application/DTOs/scheduleRule/scheduleRuleDTO";

export interface IEditScheduleRuleUsecase {
  execute(data: editScheduleRuleRequestDTO): Promise<scheduleRuleDTO>;
}
