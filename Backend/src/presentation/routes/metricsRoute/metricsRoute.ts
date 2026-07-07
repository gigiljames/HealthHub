import { Router } from "express";
import { injectedMetricsController } from "../../DI/metrics";
import { ROUTES } from "../../../domain/constants/routes";

export class MetricsRoute {
  metricsRouter: Router;

  constructor() {
    this.metricsRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.metricsRouter.get(
      ROUTES.METRICS,
      (req, res, next) => injectedMetricsController.getMetrics(req, res, next)
    );
  }
}
