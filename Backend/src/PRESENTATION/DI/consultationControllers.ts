import { ConsultationController } from "../controllers/consultation/ConsultationController";
import { JoinConsultationUseCase } from "../../application/usecases/consultation/joinConsultationUseCase";
import { EndConsultationUseCase } from "../../application/usecases/consultation/endConsultationUseCase";
import { ConsultationRepository } from "../../infrastructure/repositories/consultationRepository";
import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { socketService } from "../../infrastructure/socket/SocketIOService";

// Repositories
const consultationRepository = new ConsultationRepository();
const appointmentRepository = new AppointmentRepository();

// Usecases
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

// Controllers
export const injectedConsultationController = new ConsultationController(
  joinConsultationUseCase,
  endConsultationUseCase,
);
