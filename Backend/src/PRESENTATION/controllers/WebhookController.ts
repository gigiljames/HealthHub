import { Request, Response } from "express";
import { ConfirmPaymentWebhookUseCase } from "../../application/usecases/payment/ConfirmPaymentWebhookUseCase";
import { HandlePaymentFailureUseCase } from "../../application/usecases/payment/HandlePaymentFailureUseCase";
import { IPaymentGateway } from "../../domain/interfaces/gateways/IPaymentGateway";

export class WebhookController {
  constructor(
    private readonly confirmWebhookUseCase: ConfirmPaymentWebhookUseCase,
    private readonly failureWebhookUseCase: HandlePaymentFailureUseCase,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["stripe-signature"] as string;

    const isValid = this.paymentGateway.verifySignature(req.body, signature);
    if (!isValid) {
      res.status(400).send("Webhook Error: Invalid signature");
      return;
    }

    const event = req.body;

    try {
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

      res.status(200).send({ received: true });
    } catch (err: any) {
      console.error("[Webhook Error]", err.message);
      res.status(500).send("Webhook handler failed.");
    }
  };
}
