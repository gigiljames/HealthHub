import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { MarkAppointmentCompletedUseCase } from "../../application/usecases/booking/MarkAppointmentCompletedUseCase";
import { DoctorPayoutController } from "../controllers/DoctorPayoutController";

// Repositories
const appointmentRepository = new AppointmentRepository();

// Use Cases
const markAppointmentCompletedUseCase = new MarkAppointmentCompletedUseCase(
  appointmentRepository,
);

// Controller
export const injectedPayoutController = new DoctorPayoutController(
  markAppointmentCompletedUseCase,
);
