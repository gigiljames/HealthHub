import { Router } from "express";
import express from "express";
import { injectedWebhookController } from "../../DI/webhook";
import { ROUTES } from "../../../domain/constants/routes";

export class WebhookRoute {
  webhookRouter: Router;

  constructor() {
    this.webhookRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    this.webhookRouter.post(
      ROUTES.WEBHOOK.STRIPE,
      express.raw({ type: "application/json" }),
      injectedWebhookController.handleStripeWebhook,
    );
  }
}
