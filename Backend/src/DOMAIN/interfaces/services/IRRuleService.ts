export interface IRRuleService {
  generateDailyForWeek(startDate: Date, maxAllowedDate: Date): Date[];
  generateWeeklyForMonth(startDate: Date, maxAllowedDate: Date): Date[];
  generateDailyForMonth(startDate: Date, maxAllowedDate: Date): Date[];
}
