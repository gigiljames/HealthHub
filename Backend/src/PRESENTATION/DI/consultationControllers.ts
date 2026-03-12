import { ConsultationController } from "../controllers/consultation/ConsultationController";
import { JoinConsultationUseCase } from "../../application/usecases/consultation/joinConsultationUseCase";
import { EndConsultationUseCase } from "../../application/usecases/consultation/endConsultationUseCase";
import { ConsultationRepository } from "../../infrastructure/repositories/consultationRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { socketService } from "../../infrastructure/socket/SocketIOService";

const consultationRepository = new ConsultationRepository();
const appointmentRepository = new AppointmentRepository();

const joinConsultationUseCase = new JoinConsultationUseCase(
  consultationRepository,
  appointmentRepository,
  socketService,
);
const endConsultationUseCase = new EndConsultationUseCase(
  consultationRepository,
  appointmentRepository,
  socketService,
);

export const consultationController = new ConsultationController(
  joinConsultationUseCase,
  endConsultationUseCase,
);
