import {
  IConsultationRepository,
  IConsultationCreateData,
} from "../../domain/interfaces/repositories/IConsultationRepository";
import { Consultation } from "../../domain/entities/consultation";
import { consultationModel } from "../DB/models/consultationModel";
import { ConsultationMapper } from "../../application/mappers/consultationMapper";

export class ConsultationRepository implements IConsultationRepository {
  async create(data: IConsultationCreateData): Promise<Consultation> {
    const newConsultation = new consultationModel(data);
    await newConsultation.save();
    return ConsultationMapper.toEntityFromDocument(newConsultation.toObject());
  }

  async findByAppointmentId(
    appointmentId: string,
  ): Promise<Consultation | null> {
    const consultation = await consultationModel
      .findOne({ appointmentId })
      .lean();
    return consultation ? ConsultationMapper.toEntityFromDocument(consultation) : null;
  }

  async findByRoomId(roomId: string): Promise<Consultation | null> {
    const consultation = await consultationModel.findOne({ roomId }).lean();
    return consultation ? ConsultationMapper.toEntityFromDocument(consultation) : null;
  }

  async update(
    id: string,
    updates: Partial<IConsultationCreateData>,
  ): Promise<Consultation | null> {
    const consultation = await consultationModel
      .findByIdAndUpdate(id, updates, { new: true })
      .lean();
    return consultation ? ConsultationMapper.toEntityFromDocument(consultation) : null;
  }
}
