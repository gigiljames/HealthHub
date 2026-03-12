import { Consultation } from "../../entities/consultation";

export interface IConsultationCreateData {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientJoinedAt?: Date | null;
  doctorJoinedAt?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  roomId: string;
}

export interface IConsultationRepository {
  create(data: IConsultationCreateData): Promise<Consultation>;
  findByAppointmentId(appointmentId: string): Promise<Consultation | null>;
  findByRoomId(roomId: string): Promise<Consultation | null>;
  update(
    id: string,
    updates: Partial<IConsultationCreateData>,
  ): Promise<Consultation | null>;
}
