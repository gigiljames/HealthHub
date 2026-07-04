import { Router } from "express";
import {
  injectedConsultationController,
  injectedConsultationReportController,
  injectedPrescriptionController,
  injectedPatientMessageController,
  injectedDoctorMessageController,
} from "../../DI/consultationControllers";
import { authMiddleware } from "../../middlewares/authMiddleware";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { Roles } from "../../../domain/enums/roles";
import { ROUTES } from "../../../domain/constants/routes";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class ConsultationRoute {
  public consultationRouter: Router;

  constructor() {
    this.consultationRouter = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Live Consultation Room Routes
    this.consultationRouter.post(
      ROUTES.CONSULTATION.JOIN_CONSULTATION,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedConsultationController.joinConsultation(req, res, next);
      },
    );

    this.consultationRouter.post(
      ROUTES.CONSULTATION.END_CONSULTATION,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedConsultationController.endConsultation(req, res, next);
      },
    );

    // Consultation Report Routes
    this.consultationRouter.post(
      ROUTES.CONSULTATION.CREATE_REPORT,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedConsultationReportController.createReport(req, res, next);
      },
    );

    this.consultationRouter.get(
      ROUTES.CONSULTATION.GET_REPORT_BY_APPOINTMENT_ID,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedConsultationReportController.getReportByAppointmentId(req, res, next);
      },
    );

    this.consultationRouter.get(
      ROUTES.CONSULTATION.GET_REPORT_BY_ID,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedConsultationReportController.getReportById(req, res, next);
      },
    );

    this.consultationRouter.get(
      ROUTES.CONSULTATION.LIST_REPORTS,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedConsultationReportController.listReports(req, res, next);
      },
    );

    // Prescription Routes
    this.consultationRouter.post(
      ROUTES.CONSULTATION.CREATE_PRESCRIPTION,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedPrescriptionController.createPrescription(req, res, next);
      },
    );

    this.consultationRouter.get(
      ROUTES.CONSULTATION.GET_PRESCRIPTION_BY_APPOINTMENT_ID,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedPrescriptionController.getPrescriptionByAppointmentId(req, res, next);
      },
    );

    this.consultationRouter.get(
      ROUTES.CONSULTATION.GET_PRESCRIPTION_BY_ID,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedPrescriptionController.getPrescriptionById(req, res, next);
      },
    );

    this.consultationRouter.get(
      ROUTES.CONSULTATION.LIST_PRESCRIPTIONS,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedPrescriptionController.listPrescriptions(req, res, next);
      },
    );

    this.consultationRouter.get(
      ROUTES.CONSULTATION.VERIFY_PRESCRIPTION,
      (req, res, next) => {
        injectedPrescriptionController.verifyPrescription(req, res, next);
      },
    );

    this.consultationRouter.post(
      ROUTES.CONSULTATION.REVOKE_PRESCRIPTION,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedPrescriptionController.revokePrescription(req, res, next);
      },
    );

    // Chat Message REST Routes
    // Fetch History (Both User and Doctor can read history)
    this.consultationRouter.get(
      ROUTES.CONSULTATION.GET_MESSAGES,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedPatientMessageController.getMessages(req, res, next);
      },
    );

    // Send Message
    this.consultationRouter.post(
      ROUTES.CONSULTATION.SEND_MESSAGE,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        if (req.user?.role === Roles.USER) {
          injectedPatientMessageController.sendMessage(req, res, next);
        } else {
          injectedDoctorMessageController.sendMessage(req, res, next);
        }
      },
    );

    // Edit Message
    this.consultationRouter.put(
      ROUTES.CONSULTATION.EDIT_MESSAGE,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        if (req.user?.role === Roles.USER) {
          injectedPatientMessageController.editMessage(req, res, next);
        } else {
          injectedDoctorMessageController.editMessage(req, res, next);
        }
      },
    );

    // Soft-Delete Message
    this.consultationRouter.delete(
      ROUTES.CONSULTATION.DELETE_MESSAGE,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        if (req.user?.role === Roles.USER) {
          injectedPatientMessageController.deleteMessage(req, res, next);
        } else {
          injectedDoctorMessageController.deleteMessage(req, res, next);
        }
      },
    );

    // Mark message read
    this.consultationRouter.post(
      ROUTES.CONSULTATION.MARK_MESSAGE_READ,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        if (req.user?.role === Roles.USER) {
          injectedPatientMessageController.markAsRead(req, res, next);
        } else {
          injectedDoctorMessageController.markAsRead(req, res, next);
        }
      },
    );

    // Get chat upload URL
    this.consultationRouter.post(
      ROUTES.CONSULTATION.GET_CHAT_UPLOAD_URL,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        if (req.user?.role === Roles.USER) {
          injectedPatientMessageController.getChatUploadUrl(req, res, next);
        } else {
          injectedDoctorMessageController.getChatUploadUrl(req, res, next);
        }
      },
    );

    // Get chat access URL
    this.consultationRouter.get(
      ROUTES.CONSULTATION.GET_CHAT_ACCESS_URL,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        if (req.user?.role === Roles.USER) {
          injectedPatientMessageController.getChatAccessUrl(req, res, next);
        } else {
          injectedDoctorMessageController.getChatAccessUrl(req, res, next);
        }
      },
    );

    // Get previous chats listing
    this.consultationRouter.get(
      ROUTES.CONSULTATION.GET_CHATS,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        if (req.user?.role === Roles.USER) {
          injectedPatientMessageController.getChats(req, res, next);
        } else {
          injectedDoctorMessageController.getChats(req, res, next);
        }
      },
    );
  }
}
