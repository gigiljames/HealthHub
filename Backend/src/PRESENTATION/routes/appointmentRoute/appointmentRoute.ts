import { Router } from "express";
import { ROUTES } from "../../../domain/constants/routes";
import { authMiddleware } from "../../middlewares/authMiddleware";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { Roles } from "../../../domain/enums/roles";
import { injectedBookingController } from "../../DI/booking";
import { injectedDoctorPayoutController } from "../../DI/payout";
import {
  injectedPatientAppointmentController,
  injectedDoctorAppointmentController,
  injectedAdminAppointmentController,
  injectedAppointmentActionController,
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
    this.appointmentRouter.get(
      ROUTES.SLOT.GET_APPOINTMENT_SUMMARY,
      authMiddleware([Roles.USER], tokenService, authRepository),
      injectedBookingController.getAppointmentSummary,
    );
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
    this.appointmentRouter.get(
      ROUTES.APPOINTMENT.PREVIEW_CANCEL_APPOINTMENT,
      authMiddleware([Roles.USER], tokenService, authRepository),
      injectedPatientAppointmentController.previewCancel,
    );
    this.appointmentRouter.post(
      ROUTES.APPOINTMENT.CANCEL_APPOINTMENT,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      injectedAppointmentActionController.cancel,
    );

    this.appointmentRouter.post(
      ROUTES.APPOINTMENT.REQUEST_RESCHEDULE,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      injectedAppointmentActionController.requestReschedule,
    );
    this.appointmentRouter.post(
      ROUTES.APPOINTMENT.ACCEPT_RESCHEDULE,
      authMiddleware([Roles.USER], tokenService, authRepository),
      injectedAppointmentActionController.acceptReschedule,
    );
    this.appointmentRouter.post(
      ROUTES.APPOINTMENT.DECLINE_RESCHEDULE,
      authMiddleware([Roles.USER], tokenService, authRepository),
      injectedAppointmentActionController.declineReschedule,
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
      ROUTES.ADMIN.APPOINTMENT_MANAGEMENT.GET_APPOINTMENTS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      injectedAdminAppointmentController.getAppointments,
    );
    this.appointmentRouter.get(
      ROUTES.ADMIN.APPOINTMENT_MANAGEMENT.GET_APPOINTMENT,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      injectedAdminAppointmentController.getAppointmentById,
    );

    // Payout (mark complete)
    this.appointmentRouter.patch(
      ROUTES.APPOINTMENT.COMPLETE_APPOINTMENT,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      injectedDoctorPayoutController.markAppointmentComplete,
    );
  }
}
