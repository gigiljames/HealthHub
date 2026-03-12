import { Types } from "mongoose";
import {
  getDoctorSlotsGroupedByLocationAndDateDTO,
  groupedSlotsByDateAndLocationDTO,
  groupedSlotsByLocationAndDateDTO,
} from "../../application/DTOs/slot/slotDTO";
import { SlotMapper } from "../../application/mappers/slotMapper";
import Slot from "../../domain/entities/slot";
import { ISlotRepository } from "../../domain/interfaces/repositories/ISlotRepository";
import { slotModel, ISlotDocument } from "../DB/models/slotModel";
import { SlotStatus } from "../../domain/enums/slotStatus";
import { getISTDateRangeUTC } from "../../utils/dateTimeUtil";
import { BaseRepository } from "./base/BaseRepository";

export class SlotRepository
  extends BaseRepository<ISlotDocument>
  implements ISlotRepository
{
  constructor() {
    super(slotModel);
  }
  async findById(id: string): Promise<Slot | null> {
    const slotDoc = await this.findDocumentById(id);
    return slotDoc ? SlotMapper.toEntityFromDocument(slotDoc) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this.deleteById(id);
  }

  async findByDoctorId(id: string): Promise<Slot[]> {
    const slotDocs = await slotModel.find({ doctorId: id });
    return SlotMapper.toEntityListFromDocumentList(slotDocs);
  }

  async getDoctorSlotsGroupedByLocationAndDate(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO> {
    const { doctorId, startDate, days, future = false } = params;
    const { startUTC, endUTC } = getISTDateRangeUTC(startDate, days);

    let queryStart = startUTC;
    if (future) {
      const now = new Date();
      if (now > startUTC) {
        queryStart = now;
      }
    }

    const matchStage: any = {
      doctorId: new Types.ObjectId(doctorId),
      start: {
        $gte: queryStart,
        $lt: endUTC,
      },
    };
    // if (!includeBooked) {
    //   matchStage.status = "AVAILABLE";
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

  async getDoctorSlotsGroupedByDateAndLocation(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByDateAndLocationDTO> {
    const { doctorId, startDate, days } = params;
    const { startUTC, endUTC } = getISTDateRangeUTC(startDate, days);
    const matchStage: any = {
      doctorId: new Types.ObjectId(doctorId),
      start: {
        $gte: startUTC,
        $lt: endUTC,
      },
    };

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
            date: "$istDate",
            practiceLocationId: "$practiceLocationId",
          },
          slots: { $push: "$$ROOT" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          locations: {
            $push: {
              k: { $toString: "$_id.practiceLocationId" },
              v: "$slots",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          locations: { $arrayToObject: "$locations" },
        },
      },
    ]);

    return aggregation.reduce((acc, curr) => {
      acc[curr.date] = curr.locations;
      return acc;
    }, {} as groupedSlotsByDateAndLocationDTO);
  }

  async save(slot: Slot): Promise<Slot> {
    if (slot.id) {
      await slotModel.findByIdAndUpdate(slot.id, {
        title: slot.title,
        start: slot.start,
        end: slot.end,
        mode: slot.mode,
        practiceLocationId: slot.practiceLocationId,
        status: slot.status,
        lockedUntil: slot.lockedUntil,
        lockedBy: slot.lockedBy,
        appointmentId: slot.appointmentId,
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
        status: slot.status,
        lockedUntil: slot.lockedUntil,
        lockedBy: slot.lockedBy,
        appointmentId: slot.appointmentId,
      });
      return SlotMapper.toEntityFromDocument(slotDoc);
    }
  }

  async lockSlotAtomically(
    slotId: string,
    patientId: string,
    lockExpiry: Date,
    now: Date,
  ): Promise<Slot | null> {
    const doc = await slotModel.findOneAndUpdate(
      {
        _id: slotId,
        $or: [
          { status: SlotStatus.AVAILABLE },
          { status: SlotStatus.LOCKED, lockedUntil: { $lt: now } },
        ],
      },
      {
        $set: {
          status: SlotStatus.LOCKED,
          lockedBy: patientId,
          lockedUntil: lockExpiry,
        },
      },
      { new: true },
    );

    if (!doc) return null;
    return SlotMapper.toEntityFromDocument(doc);
  }

  async unlockSlot(slotId: string): Promise<void> {
    await slotModel.updateOne(
      { _id: slotId },
      {
        $set: {
          status: SlotStatus.AVAILABLE,
          lockedBy: null,
          lockedUntil: null,
        },
      },
    );
  }

  async markSlotAsBooked(
    slotId: string,
    appointmentId: string,
    session?: any,
  ): Promise<void> {
    await slotModel.updateOne(
      { _id: slotId },
      {
        $set: {
          status: SlotStatus.BOOKED,
          appointmentId: appointmentId,
        },
      },
      { session },
    );
  }

  async releaseExpiredLocks(now: Date): Promise<number> {
    const result = await slotModel.updateMany(
      { status: SlotStatus.LOCKED, lockedUntil: { $lt: now } },
      {
        $set: {
          status: SlotStatus.AVAILABLE,
          lockedBy: null,
          lockedUntil: null,
        },
      },
    );
    return result.modifiedCount;
  }
}
