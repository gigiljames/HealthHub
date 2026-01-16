import Slot from "../../domain/entities/slot";
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
      isBooked: doc.isBooked,
    });
  }

  static toEntityListFromDocumentList(docList: ISlotDocument[]) {
    return docList.map((doc) => this.toEntityFromDocument(doc));
  }

  static toSlotDTOFromEntity(doc: Slot): slotDTO {
    const dto: slotDTO = {
      id: doc.id!,
      title: doc.title,
      start: doc.start,
      end: doc.end,
      mode: doc.mode,
      isBooked: doc.isBooked,
    };
    return dto;
  }

  static toSlotDTOListFromEntityList(docList: Slot[]) {
    return docList.map((doc) => this.toSlotDTOFromEntity(doc));
  }
}
