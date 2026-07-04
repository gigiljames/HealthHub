import ScheduleRule from "../../entities/scheduleRule";

export interface IScheduleRuleRepository {
  findById(id: string): Promise<ScheduleRule | null>;
  deleteById(id: string): Promise<void>;
  findByDoctorId(doctorId: string): Promise<ScheduleRule[]>;
  findActiveByDoctorId(doctorId: string): Promise<ScheduleRule[]>;
  findActiveRulesInRange(
    doctorId: string,
    start: Date,
    end: Date,
  ): Promise<ScheduleRule[]>;
  save(rule: ScheduleRule): Promise<ScheduleRule>;
  toggleActive(id: string, isActive: boolean): Promise<ScheduleRule | null>;
}
