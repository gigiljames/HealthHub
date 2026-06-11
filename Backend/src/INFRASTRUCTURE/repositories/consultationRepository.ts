import {
  IConsultationRepository,
  IConsultationCreateData,
} from "../../domain/interfaces/repositories/IConsultationRepository";
import { Consultation } from "../../domain/entities/consultation";
import { consultationModel, IConsultationDocument } from "../DB/models/consultationModel";
import { ConsultationMapper } from "../../application/mappers/consultationMapper";
import { BaseRepository } from "./base/BaseRepository";

export class ConsultationRepository
  extends BaseRepository<IConsultationDocument>
  implements IConsultationRepository
{
  constructor() {
    super(consultationModel);
  }

  async findById(id: string): Promise<Consultation | null> {
    const doc = await this.findDocumentById(id);
    return doc ? ConsultationMapper.toEntityFromDocument(doc.toObject()) : null;
  }

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

  async updateSocketIds(
    id: string,
    updates: { patientSocketId?: string | null; doctorSocketId?: string | null },
  ): Promise<Consultation | null> {
    const consultation = await consultationModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .lean();
    return consultation ? ConsultationMapper.toEntityFromDocument(consultation) : null;
  }

  async findBySocketId(socketId: string): Promise<Consultation | null> {
    const consultation = await consultationModel
      .findOne({
        $or: [{ patientSocketId: socketId }, { doctorSocketId: socketId }],
      })
      .lean();
    return consultation ? ConsultationMapper.toEntityFromDocument(consultation) : null;
  }

  async clearAllSockets(): Promise<void> {
    await consultationModel.updateMany(
      {},
      { $set: { patientSocketId: null, doctorSocketId: null } },
    );
  }
}
