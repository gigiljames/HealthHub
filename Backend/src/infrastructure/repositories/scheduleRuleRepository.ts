import { Types } from "mongoose";
import ScheduleRule from "../../domain/entities/scheduleRule";
import { IScheduleRuleRepository } from "../../domain/interfaces/repositories/IScheduleRuleRepository";
import {
  scheduleRuleModel,
  IScheduleRuleDocument,
} from "../DB/models/scheduleRuleModel";
import { ScheduleRuleMapper } from "../../application/mappers/scheduleRuleMapper";
import { BaseRepository } from "./base/BaseRepository";

export class ScheduleRuleRepository
  extends BaseRepository<IScheduleRuleDocument>
  implements IScheduleRuleRepository
{
  constructor() {
    super(scheduleRuleModel);
  }

  async findById(id: string): Promise<ScheduleRule | null> {
    const doc = await this.findDocumentById(id);
    return doc ? ScheduleRuleMapper.toEntityFromDocument(doc) : null;
  }

  async findByDoctorId(doctorId: string): Promise<ScheduleRule[]> {
    const docs = await scheduleRuleModel.find({
      doctorId: new Types.ObjectId(doctorId),
    });
    return ScheduleRuleMapper.toEntityListFromDocumentList(docs);
  }

  async findActiveByDoctorId(doctorId: string): Promise<ScheduleRule[]> {
    const docs = await scheduleRuleModel.find({
      doctorId: new Types.ObjectId(doctorId),
      isActive: true,
    });
    return ScheduleRuleMapper.toEntityListFromDocumentList(docs);
  }

  async findActiveRulesInRange(
    doctorId: string,
    start: Date,
    end: Date,
  ): Promise<ScheduleRule[]> {
    const docs = await scheduleRuleModel.find({
      doctorId: new Types.ObjectId(doctorId),
      isActive: true,
      validFrom: { $lte: end },
      $or: [{ validTo: null }, { validTo: { $gte: start } }],
    });
    return ScheduleRuleMapper.toEntityListFromDocumentList(docs);
  }

  async save(rule: ScheduleRule): Promise<ScheduleRule> {
    if (rule.id) {
      await scheduleRuleModel.findByIdAndUpdate(rule.id, {
        title: rule.title,
        practiceLocationId: rule.practiceLocationId,
        mode: rule.mode,
        duration: rule.duration,
        buffer: rule.buffer,
        rruleString: rule.rruleString,
        validFrom: rule.validFrom,
        validTo: rule.validTo,
        startHour: rule.startHour,
        endHour: rule.endHour,
        isActive: rule.isActive,
      });
      return rule;
    } else {
      const doc = await scheduleRuleModel.create({
        doctorId: rule.doctorId,
        title: rule.title,
        practiceLocationId: rule.practiceLocationId,
        mode: rule.mode,
        duration: rule.duration,
        buffer: rule.buffer,
        rruleString: rule.rruleString,
        validFrom: rule.validFrom,
        validTo: rule.validTo,
        startHour: rule.startHour,
        endHour: rule.endHour,
        isActive: rule.isActive,
      });
      return ScheduleRuleMapper.toEntityFromDocument(doc);
    }
  }

  async toggleActive(
    id: string,
    isActive: boolean,
  ): Promise<ScheduleRule | null> {
    const doc = await scheduleRuleModel.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true },
    );
    return doc ? ScheduleRuleMapper.toEntityFromDocument(doc) : null;
  }
}
