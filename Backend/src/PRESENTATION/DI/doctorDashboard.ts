import { AppointmentRepository } from "../../infrastructure/repositories/appointmentRepository";
import { GetDoctorDayScheduleUseCase } from "../../application/usecases/doctor/GetDoctorDayScheduleUseCase";
import { GetDoctorAnalysisUseCase } from "../../application/usecases/doctor/GetDoctorAnalysisUseCase";
import { DoctorDashboardController } from "../controllers/doctor/DoctorDashboardController";
import { getSlotsUsecase } from "./slot";

const appointmentRepository = new AppointmentRepository();

const getDoctorDayScheduleUseCase = new GetDoctorDayScheduleUseCase(
  appointmentRepository,
  getSlotsUsecase,
);

const getDoctorAnalysisUseCase = new GetDoctorAnalysisUseCase(
  appointmentRepository
);

export const injectedDoctorDashboardController = new DoctorDashboardController(
  getDoctorDayScheduleUseCase,
  getDoctorAnalysisUseCase,
);
