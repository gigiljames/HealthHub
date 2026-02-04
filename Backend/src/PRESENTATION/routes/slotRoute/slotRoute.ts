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
  }
}
