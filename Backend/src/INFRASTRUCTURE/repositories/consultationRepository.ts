import {
  IConsultationRepository,
  IConsultationCreateData,
} from "../../domain/interfaces/repositories/IConsultationRepository";
import { Consultation } from "../../domain/entities/consultation";
import { consultationModel } from "../DB/models/consultationModel";

export class ConsultationRepository implements IConsultationRepository {
  private mapToDomain(doc: any): Consultation {
    return new Consultation({
      id: doc._id.toString(),
      appointmentId: doc.appointmentId.toString(),
      patientId: doc.patientId.toString(),
      doctorId: doc.doctorId.toString(),
      patientJoinedAt: doc.patientJoinedAt,
      doctorJoinedAt: doc.doctorJoinedAt,
      startedAt: doc.startedAt,
      endedAt: doc.endedAt,
      roomId: doc.roomId,
    });
  }

  async create(data: IConsultationCreateData): Promise<Consultation> {
    const newConsultation = new consultationModel(data);
    await newConsultation.save();
    return this.mapToDomain(newConsultation.toObject());
  }

  async findByAppointmentId(
    appointmentId: string,
  ): Promise<Consultation | null> {
    const consultation = await consultationModel
      .findOne({ appointmentId })
      .lean();
    return consultation ? this.mapToDomain(consultation) : null;
  }

  async findByRoomId(roomId: string): Promise<Consultation | null> {
    const consultation = await consultationModel.findOne({ roomId }).lean();
    return consultation ? this.mapToDomain(consultation) : null;
  }

  async update(
    id: string,
    updates: Partial<IConsultationCreateData>,
  ): Promise<Consultation | null> {
    const consultation = await consultationModel
      .findByIdAndUpdate(id, updates, { new: true })
      .lean();
    return consultation ? this.mapToDomain(consultation) : null;
  }
}
