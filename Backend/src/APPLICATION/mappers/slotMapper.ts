import Slot from "../../domain/entities/slot";
import { SlotStatus } from "../../domain/enums/slotStatus";
import { ISlotDocument } from "../../infrastructure/DB/models/slotModel";
import { slotDTO } from "../DTOs/slot/slotDTO";

export class SlotMapper {
  static toEntityFromDocument(doc: ISlotDocument): Slot {
    return new Slot({
      id: doc._id?.toString(),
      doctorId: doc.doctorId.toString(),
      title: doc.title,
      start: doc.start,
      end: doc.end,
      mode: doc.mode,
      practiceLocationId: doc.practiceLocationId,
      status: doc.status,
      lockedUntil: doc.lockedUntil,
      lockedBy: doc.lockedBy?.toString() ?? null,
      appointmentId: doc.appointmentId?.toString() ?? null,
      scheduleRuleId: doc.scheduleRuleId?.toString() ?? null,
    });
  }

  static toEntityListFromDocumentList(docList: ISlotDocument[]): Slot[] {
    return docList.map((doc) => this.toEntityFromDocument(doc));
  }

  static toSlotDTOFromEntity(doc: Slot): slotDTO {
    return {
      id: doc.id ?? undefined,
      title: doc.title,
      start: doc.start.toISOString(),
      end: doc.end.toISOString(),
      mode: doc.mode,
      practiceLocationId: doc.practiceLocationId,
      status: doc.status,
      lockedUntil: doc.lockedUntil?.toISOString() ?? null,
      lockedBy: doc.lockedBy,
      appointmentId: doc.appointmentId,
      scheduleRuleId: doc.scheduleRuleId,
      isVirtual: false,
    };
  }

  static toSlotDTOListFromEntityList(docList: Slot[]): slotDTO[] {
    return docList.map((doc) => this.toSlotDTOFromEntity(doc));
  }

  static createVirtualSlotDTO(
    rule: {
      id: string;
      title: string;
      practiceLocationId: string;
      mode: "online" | "in-person";
    },
    start: Date,
    end: Date,
  ): slotDTO {
    return {
      id: `vslot_${rule.id}_${start.getTime()}`,
      title: rule.title,
      start: start.toISOString(),
      end: end.toISOString(),
      mode: rule.mode,
      practiceLocationId: rule.practiceLocationId,
      status: SlotStatus.AVAILABLE,
      scheduleRuleId: rule.id,
      isVirtual: true,
    };
  }
}
