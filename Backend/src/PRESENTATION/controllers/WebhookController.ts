import { NextFunction, Request, Response } from "express";
import { ConfirmPaymentWebhookUseCase } from "../../application/usecases/payment/ConfirmPaymentWebhookUseCase";
import { HandlePaymentFailureUseCase } from "../../application/usecases/payment/HandlePaymentFailureUseCase";
import { IPaymentService } from "../../domain/interfaces/services/IPaymentService";
import { CustomError } from "../../domain/entities/customError";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import Stripe from "stripe";
import { MESSAGES } from "../../domain/constants/messages";
import { logger } from "../../utils/logger";

export class WebhookController {
  constructor(
    private readonly _confirmWebhookUseCase: ConfirmPaymentWebhookUseCase,
    private readonly _failureWebhookUseCase: HandlePaymentFailureUseCase,
    private readonly _paymentService: IPaymentService,
  ) {}

  handleStripeWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.STRIPE.MISSING_SIGNATURE,
        );
      }
      const event: Stripe.Event = this._paymentService.verifySignature(
        req.body,
        signature as string,
      );
      if (!event) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.STRIPE.INVALID_SIGNATURE,
        );
      }
      switch (event.type) {
        case "checkout.session.completed":
          await this._confirmWebhookUseCase.execute(event.data.object.id);
          break;
        case "checkout.session.expired":
        case "payment_intent.payment_failed":
          await this._failureWebhookUseCase.execute(
            event.data.object.id,
            // "Payment failed or expired",
          );
          break;
        default:
          logger.info(`Unhandled event type ${event.type}`);
      }
      res.status(HttpStatusCodes.OK).send({ received: true });
    } catch (err) {
      logger.error("[Webhook Error]", err);
      next(err);
    }
  };
}
