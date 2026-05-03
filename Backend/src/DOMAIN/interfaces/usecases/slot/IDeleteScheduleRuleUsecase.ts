export interface IDeleteScheduleRuleUsecase {
  execute(id: string): Promise<string>;
}
