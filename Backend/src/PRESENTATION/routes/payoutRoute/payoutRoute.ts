import { Router } from "express";
import {
  injectedDoctorPayoutController,
  injectedAdminPayoutController,
} from "../../DI/payout";
import { ROUTES } from "../../../domain/constants/routes";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class PayoutRoute {
  payoutRouter: Router;

  constructor() {
    this.payoutRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.payoutRouter.patch(
      ROUTES.APPOINTMENT.COMPLETE_APPOINTMENT,
      injectedDoctorPayoutController.markAppointmentComplete,
    );

    this.payoutRouter.get(
      ROUTES.PAYOUT.GET_DOCTOR_PAYOUTS,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorPayoutController.getPayouts(req, res);
      },
    );

    this.payoutRouter.get(
      ROUTES.PAYOUT.GET_DOCTOR_PAYOUT_DETAILS,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      (req, res, next) => {
        injectedDoctorPayoutController.getPayoutDetails(req, res);
      },
    );

    this.payoutRouter.get(
      ROUTES.PAYOUT.GET_ADMIN_PAYOUTS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminPayoutController.getPayouts(req, res);
      },
    );

    this.payoutRouter.get(
      ROUTES.PAYOUT.GET_ADMIN_PAYOUT_DETAILS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedAdminPayoutController.getPayoutDetails(req, res);
      },
    );
  }
}
