import { Router } from "express";
import express from "express";
import { injectedWebhookController } from "../../DI/webhook";

export class WebhookRoute {
  webhookRouter: Router;

  constructor() {
    this.webhookRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    // Stripe requires raw body to verify signatures properly
    this.webhookRouter.post(
      "/stripe",
      express.raw({ type: "application/json" }),
      injectedWebhookController.handleStripeWebhook,
    );
  }
}
