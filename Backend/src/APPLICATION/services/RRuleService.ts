import { IRRuleService } from "../../domain/interfaces/services/IRRuleService";
import { RRule, rrulestr } from "rrule";

export class RRuleService implements IRRuleService {
  generateDailyForWeek(startDate: Date, maxAllowedDate: Date): Date[] {
    const endOfWeek = new Date(startDate);
    endOfWeek.setDate(startDate.getDate() + (6 - startDate.getDay()));
    const untilDate = endOfWeek > maxAllowedDate ? maxAllowedDate : endOfWeek;
    const rule = new RRule({
      freq: RRule.DAILY,
      dtstart: startDate,
      until: untilDate,
    });
    return rule.all();
  }

  generateWeeklyForMonth(startDate: Date, maxAllowedDate: Date): Date[] {
    const weekdayMap = [
      RRule.SU,
      RRule.MO,
      RRule.TU,
      RRule.WE,
      RRule.TH,
      RRule.FR,
      RRule.SA,
    ];
    const weekday = weekdayMap[startDate.getDay()];
    const rule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [weekday],
      dtstart: startDate,
      until: maxAllowedDate,
    });
    return rule.all();
  }

  generateDailyForMonth(startDate: Date, maxAllowedDate: Date): Date[] {
    const endOfMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const untilDate = endOfMonth > maxAllowedDate ? maxAllowedDate : endOfMonth;
    const rule = new RRule({
      freq: RRule.DAILY,
      dtstart: startDate,
      until: untilDate,
    });
    return rule.all();
  }

  generateOccurrences(rruleString: string, start: Date, end: Date): Date[] {
    try {
      const rule = rrulestr(rruleString);
      return rule.between(start, end, true);
    } catch (error) {
      console.error("Error generating RRule occurrences:", error);
      return [];
    }
  }
}
