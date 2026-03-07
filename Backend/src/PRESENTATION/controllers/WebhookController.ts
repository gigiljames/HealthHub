import { NextFunction, Request, Response } from "express";
import { ConfirmPaymentWebhookUseCase } from "../../application/usecases/payment/ConfirmPaymentWebhookUseCase";
import { HandlePaymentFailureUseCase } from "../../application/usecases/payment/HandlePaymentFailureUseCase";
import { IPaymentService } from "../../domain/interfaces/services/IPaymentService";
import { CustomError } from "../../domain/entities/customError";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import Stripe from "stripe";

export class WebhookController {
  constructor(
    private readonly confirmWebhookUseCase: ConfirmPaymentWebhookUseCase,
    private readonly failureWebhookUseCase: HandlePaymentFailureUseCase,
    private readonly paymentService: IPaymentService,
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
          "Webhook Error: Missing signature",
        );
      }
      const event: Stripe.Event = this.paymentService.verifySignature(
        req.body,
        signature as string,
      );
      if (!event) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          "Webhook Error: Invalid signature",
        );
      }
      switch (event.type) {
        case "checkout.session.completed":
          await this.confirmWebhookUseCase.execute(event.data.object.id);
          break;
        case "checkout.session.expired":
        case "payment_intent.payment_failed":
          await this.failureWebhookUseCase.execute(
            event.data.object.id,
            "Payment failed or expired",
          );
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      res.status(HttpStatusCodes.OK).send({ received: true });
    } catch (err: any) {
      console.error("[Webhook Error]", err.message);
      next(err);
    }
  };
}
