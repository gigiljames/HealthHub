import { SlotMapper } from "../../application/mappers/slotMapper";
import Slot from "../../domain/entities/slot";
import { ISlotRepository } from "../../domain/interfaces/repositories/ISlotRepository";
import { slotModel } from "../DB/models/slotModel";

export class SlotRepository implements ISlotRepository {
  async findById(id: string): Promise<Slot | null> {
    const slotDoc = await slotModel.findById(id);
    if (slotDoc) {
      return SlotMapper.toEntityFromDocument(slotDoc);
    } else {
      return null;
    }
  }

  async deleteById(id: string): Promise<string> {
    await slotModel.findByIdAndDelete(id);
    return id;
  }

  async findByDoctorId(id: string): Promise<Slot[]> {
    const slotDocs = await slotModel.find({ doctorId: id });
    return SlotMapper.toEntityListFromDocumentList(slotDocs);
  }

  async save(slot: Slot): Promise<Slot> {
    if (slot.id) {
      await slotModel.findByIdAndUpdate(slot.id, {
        title: slot.title,
        start: slot.start,
        end: slot.end,
        mode: slot.mode,
        isBooked: slot.isBooked,
      });
      return slot;
    } else {
      const slotDoc = await slotModel.create({
        doctorId: slot.doctorId,
        title: slot.title,
        start: slot.start,
        end: slot.end,
        mode: slot.mode,
        isBooked: slot.isBooked,
      });
      return SlotMapper.toEntityFromDocument(slotDoc);
    }
  }
}
