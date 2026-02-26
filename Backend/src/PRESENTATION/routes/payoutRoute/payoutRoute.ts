import { Router } from "express";
import { injectedPayoutController } from "../../DI/payout";
import { ROUTES } from "../../../domain/constants/routes";

export class PayoutRoute {
  payoutRouter: Router;

  constructor() {
    this.payoutRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.payoutRouter.patch(
      ROUTES.APPOINTMENT.COMPLETE_APPOINTMENT,
      injectedPayoutController.markAppointmentComplete,
    );
  }
}
