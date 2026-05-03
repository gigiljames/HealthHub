import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { GetDoctorDayScheduleUseCase } from "../../application/usecases/doctor/GetDoctorDayScheduleUseCase";
import { GetDoctorAnalysisUseCase } from "../../application/usecases/doctor/GetDoctorAnalysisUseCase";
import { DoctorDashboardController } from "../controllers/doctor/DoctorDashboardController";

const appointmentRepository = new AppointmentRepository();
const slotRepository = new SlotRepository();

const getDoctorDayScheduleUseCase = new GetDoctorDayScheduleUseCase(
  appointmentRepository,
  slotRepository,
);

const getDoctorAnalysisUseCase = new GetDoctorAnalysisUseCase(
  appointmentRepository
);

export const injectedDoctorDashboardController = new DoctorDashboardController(
  getDoctorDayScheduleUseCase,
  getDoctorAnalysisUseCase,
);
