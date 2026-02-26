import { Router } from "express";
import { ROUTES } from "../../../domain/constants/routes";
import { authMiddleware } from "../../middlewares/authMiddleware";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { Roles } from "../../../domain/enums/roles";
import { injectedBookingController } from "../../DI/booking";
import { injectedPayoutController } from "../../DI/payout";
import {
  injectedPatientAppointmentController,
  injectedDoctorAppointmentController,
  injectedAdminAppointmentController,
} from "../../DI/appointmentControllers";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class AppointmentRoute {
  appointmentRouter: Router;

  constructor() {
    this.appointmentRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    // Booking (lock + book)
    this.appointmentRouter.post(
      ROUTES.SLOT.LOCK_SLOT,
      authMiddleware([Roles.USER], tokenService, authRepository),
      injectedBookingController.lockSlot,
    );
    this.appointmentRouter.post(
      ROUTES.SLOT.BOOK_APPOINTMENT,
      authMiddleware([Roles.USER], tokenService, authRepository),
      injectedBookingController.bookAppointment,
    );

    // Patient
    this.appointmentRouter.get(
      ROUTES.APPOINTMENT.GET_PATIENT_APPOINTMENTS,
      authMiddleware([Roles.USER], tokenService, authRepository),
      injectedPatientAppointmentController.getAppointments,
    );
    this.appointmentRouter.get(
      ROUTES.APPOINTMENT.GET_PATIENT_APPOINTMENT,
      authMiddleware([Roles.USER], tokenService, authRepository),
      injectedPatientAppointmentController.getAppointmentById,
    );

    // Doctor
    this.appointmentRouter.get(
      ROUTES.APPOINTMENT.GET_DOCTOR_APPOINTMENTS,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      injectedDoctorAppointmentController.getAppointments,
    );
    this.appointmentRouter.get(
      ROUTES.APPOINTMENT.GET_DOCTOR_APPOINTMENT,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      injectedDoctorAppointmentController.getAppointmentById,
    );

    // Admin
    this.appointmentRouter.get(
      ROUTES.APPOINTMENT.GET_ALL_APPOINTMENTS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      injectedAdminAppointmentController.getAppointments,
    );
    this.appointmentRouter.get(
      ROUTES.APPOINTMENT.GET_ADMIN_APPOINTMENT,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      injectedAdminAppointmentController.getAppointmentById,
    );

    // Payout (mark complete)
    this.appointmentRouter.patch(
      ROUTES.APPOINTMENT.COMPLETE_APPOINTMENT,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      injectedPayoutController.markAppointmentComplete,
    );
  }
}
