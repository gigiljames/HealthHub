import ScheduleRule from "../../domain/entities/scheduleRule";
import { IScheduleRuleDocument } from "../../infrastructure/DB/models/scheduleRuleModel";
import { scheduleRuleDTO } from "../DTOs/scheduleRule/scheduleRuleDTO";

export class ScheduleRuleMapper {
  static toEntityFromDocument(doc: IScheduleRuleDocument): ScheduleRule {
    return new ScheduleRule({
      id: doc._id.toString(),
      doctorId: doc.doctorId.toString(),
      title: doc.title,
      practiceLocationId: doc.practiceLocationId,
      mode: doc.mode,
      duration: doc.duration,
      buffer: doc.buffer,
      rruleString: doc.rruleString,
      validFrom: doc.validFrom,
      validTo: doc.validTo ?? null,
      startHour: doc.startHour,
      endHour: doc.endHour,
      isActive: doc.isActive,
    });
  }

  static toEntityListFromDocumentList(
    docs: IScheduleRuleDocument[],
  ): ScheduleRule[] {
    return docs.map((doc) => this.toEntityFromDocument(doc));
  }

  static toDTOFromEntity(rule: ScheduleRule): scheduleRuleDTO {
    return {
      id: rule.id ?? undefined,
      doctorId: rule.doctorId,
      title: rule.title,
      practiceLocationId: rule.practiceLocationId,
      mode: rule.mode,
      duration: rule.duration,
      buffer: rule.buffer,
      rruleString: rule.rruleString,
      validFrom: rule.validFrom.toISOString(),
      validTo: rule.validTo ? rule.validTo.toISOString() : null,
      startHour: rule.startHour,
      endHour: rule.endHour,
      isActive: rule.isActive,
    };
  }

  static toDTOListFromEntityList(rules: ScheduleRule[]): scheduleRuleDTO[] {
    return rules.map((r) => this.toDTOFromEntity(r));
  }
}
