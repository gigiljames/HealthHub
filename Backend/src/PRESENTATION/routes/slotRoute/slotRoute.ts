import { Router } from "express";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { ROUTES } from "../../../domain/constants/routes";
import { Roles } from "../../../domain/enums/roles";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { injectedSlotController } from "../../DI/slot";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class SlotRoute {
  slotRouter: Router;
  constructor() {
    this.slotRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    // Normal Slots
    this.slotRouter.get(
      ROUTES.SLOT.GET_SLOTS,
      authMiddleware([Roles.DOCTOR, Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.getSlots(req, res, next);
      },
    );

    this.slotRouter.post(
      ROUTES.SLOT.GET_FULL_CALENDAR_SLOTS,
      authMiddleware([Roles.DOCTOR, Roles.USER], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.getFullCalendarSlots(req, res, next);
      },
    );

    this.slotRouter.post(
      ROUTES.SLOT.CREATE_SLOT,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.createSlot(req, res, next);
      },
    );

    this.slotRouter.post(
      ROUTES.SLOT.CREATE_RECURRING_SLOTS,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.createRecurringSlots(req, res, next);
      },
    );

    this.slotRouter.patch(
      ROUTES.SLOT.EDIT_SLOT,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.editSlot(req, res, next);
      },
    );

    this.slotRouter.delete(
      ROUTES.SLOT.DELETE_SLOT,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.deleteSlot(req, res, next);
      },
    );

    this.slotRouter.patch(
      ROUTES.SLOT.BLOCK_SLOT,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.blockSlot(req, res, next);
      },
    );

    this.slotRouter.patch(
      ROUTES.SLOT.UNBLOCK_SLOT,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.unblockSlot(req, res, next);
      },
    );

    // Schedule Rules
    this.slotRouter.get(
      ROUTES.SCHEDULE_RULE.GET_RULES,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.getScheduleRules(req, res, next);
      },
    );

    this.slotRouter.post(
      ROUTES.SCHEDULE_RULE.CREATE_RULE,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.createScheduleRule(req, res, next);
      },
    );

    this.slotRouter.patch(
      ROUTES.SCHEDULE_RULE.EDIT_RULE,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.editScheduleRule(req, res, next);
      },
    );

    this.slotRouter.delete(
      ROUTES.SCHEDULE_RULE.DELETE_RULE,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.deleteScheduleRule(req, res, next);
      },
    );

    this.slotRouter.patch(
      ROUTES.SCHEDULE_RULE.TOGGLE_RULE,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.toggleScheduleRule(req, res, next);
      },
    );

    // Doctor Exceptions
    this.slotRouter.get(
      ROUTES.DOCTOR_EXCEPTION.GET_EXCEPTIONS,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.getDoctorExceptions(req, res, next);
      },
    );

    this.slotRouter.post(
      ROUTES.DOCTOR_EXCEPTION.CREATE_EXCEPTION,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.createDoctorException(req, res, next);
      },
    );

    this.slotRouter.delete(
      ROUTES.DOCTOR_EXCEPTION.DELETE_EXCEPTION,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedSlotController.deleteDoctorException(req, res, next);
      },
    );
  }
}
