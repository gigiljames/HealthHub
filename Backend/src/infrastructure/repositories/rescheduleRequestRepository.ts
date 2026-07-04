import { Types } from "mongoose";
import RescheduleRequest from "../../domain/entities/rescheduleRequest";
import { IRescheduleRequestRepository } from "../../domain/interfaces/repositories/IRescheduleRequestRepository";
import { rescheduleRequestModel, IRescheduleRequestDocument } from "../DB/models/rescheduleRequestModel";
import { RescheduleRequestRepoMapper } from "./mappers/rescheduleRequestRepoMapper";
import { BaseRepository } from "./base/BaseRepository";

export class RescheduleRequestRepository
  extends BaseRepository<IRescheduleRequestDocument>
  implements IRescheduleRequestRepository
{
  constructor() {
    super(rescheduleRequestModel);
  }

  async findById(id: string): Promise<RescheduleRequest | null> {
    const doc = await this.findDocumentById(id);
    return doc ? RescheduleRequestRepoMapper.toEntityFromDocument(doc) : null;
  }

  async create(request: RescheduleRequest): Promise<RescheduleRequest> {
    const doc = await rescheduleRequestModel.create({
      appointmentId: new Types.ObjectId(request.appointmentId),
      oldSlotId: new Types.ObjectId(request.oldSlotId),
      newSlotId: new Types.ObjectId(request.newSlotId),
      doctorId: new Types.ObjectId(request.doctorId),
      patientId: new Types.ObjectId(request.patientId),
      status: request.status,
      reason: request.reason,
      customReason: request.customReason,
    });
    return RescheduleRequestRepoMapper.toEntityFromDocument(doc);
  }

  async save(request: RescheduleRequest): Promise<RescheduleRequest> {
    if (!request.id) {
      return this.create(request);
    }
    const doc = await rescheduleRequestModel.findByIdAndUpdate(
      request.id,
      {
        $set: {
          status: request.status,
          reason: request.reason,
          customReason: request.customReason,
        },
      },
      { new: true },
    );
    if (!doc) {
      throw new Error("Reschedule request not found for update");
    }
    return RescheduleRequestRepoMapper.toEntityFromDocument(doc);
  }

  async findPendingByAppointmentId(appointmentId: string): Promise<RescheduleRequest | null> {
    if (!Types.ObjectId.isValid(appointmentId)) return null;
    const doc = await rescheduleRequestModel.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
      status: "PENDING",
    });
    return doc ? RescheduleRequestRepoMapper.toEntityFromDocument(doc) : null;
  }
}
