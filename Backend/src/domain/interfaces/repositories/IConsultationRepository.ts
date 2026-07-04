import { Consultation } from "../../entities/consultation";
import { IBaseRepository } from "./IBaseRepository";

export interface IConsultationCreateData {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientJoinedAt?: Date | null;
  doctorJoinedAt?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  roomId: string;
  patientSocketId?: string | null;
  doctorSocketId?: string | null;
}

export interface IConsultationRepository extends IBaseRepository<Consultation> {
  create(data: IConsultationCreateData): Promise<Consultation>;
  findByAppointmentId(appointmentId: string): Promise<Consultation | null>;
  findByRoomId(roomId: string): Promise<Consultation | null>;
  update(
    id: string,
    updates: Partial<IConsultationCreateData>,
  ): Promise<Consultation | null>;
  updateSocketIds(
    id: string,
    updates: { patientSocketId?: string | null; doctorSocketId?: string | null },
  ): Promise<Consultation | null>;
  findBySocketId(socketId: string): Promise<Consultation | null>;
  clearAllSockets(): Promise<void>;
}
