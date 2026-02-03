import { Types } from "mongoose";
import {
  getDoctorSlotsGroupedByLocationAndDateDTO,
  groupedSlotsByLocationAndDateDTO,
} from "../../application/DTOs/slot/slotDTO";
import { SlotMapper } from "../../application/mappers/slotMapper";
import Slot from "../../domain/entities/slot";
import { ISlotRepository } from "../../domain/interfaces/repositories/ISlotRepository";
import { getISTDateRangeUTC } from "../../utils/dateTimeUtil";
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

  async getDoctorSlotsGroupedByLocationAndDate(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO> {
    const { doctorId, startDate, days } = params;
    const { startUTC, endUTC } = getISTDateRangeUTC(startDate, days);
    const matchStage: any = {
      doctorId: new Types.ObjectId(doctorId),
      start: {
        $gte: startUTC,
        $lt: endUTC,
      },
    };
    // if (!includeBooked) {
    //   matchStage.isBooked = false;
    // }
    const aggregation = await slotModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          istDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$start",
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
      { $sort: { start: 1 } },
      {
        $group: {
          _id: {
            practiceLocationId: "$practiceLocationId",
            date: "$istDate",
          },
          slots: { $push: "$$ROOT" },
        },
      },
      {
        $group: {
          _id: "$_id.practiceLocationId",
          dates: {
            $push: {
              k: "$_id.date",
              v: "$slots",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          practiceLocationId: "$_id",
          dates: { $arrayToObject: "$dates" },
        },
      },
    ]);
    return aggregation.reduce((acc, curr) => {
      acc[curr.practiceLocationId] = curr.dates;
      return acc;
    }, {} as groupedSlotsByLocationAndDateDTO);
  }

  async save(slot: Slot): Promise<Slot> {
    if (slot.id) {
      await slotModel.findByIdAndUpdate(slot.id, {
        title: slot.title,
        start: slot.start,
        end: slot.end,
        mode: slot.mode,
        practiceLocationId: slot.practiceLocationId,
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
        practiceLocationId: slot.practiceLocationId,
        isBooked: slot.isBooked,
      });
      return SlotMapper.toEntityFromDocument(slotDoc);
    }
  }
}
