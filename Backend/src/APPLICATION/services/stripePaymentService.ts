import Stripe from "stripe";
import { env } from "../../config/envConfig";
import { IPaymentService } from "../../domain/interfaces/services/IPaymentService";

export class StripePaymentService implements IPaymentService {
  private readonly _stripe: Stripe;

  constructor() {
    this._stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }

  async createIntent(
    amount: number,
    currency: string,
    metadata: any,
  ): Promise<{ gatewayRef: string; paymentUrl: string }> {
    const session = await this._stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: `Order #${metadata.appointmentId}` },
            unit_amount: amount * 100, // amount in smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: metadata.email,
      success_url: `${env.FRONTEND_URL}/appointments/{CHECKOUT_SESSION_ID}/confirmation?status=success`,
      cancel_url: `${env.FRONTEND_URL}/appointments/{CHECKOUT_SESSION_ID}/confirmation?status=failure`,
      metadata: metadata,
    });
    return {
      gatewayRef: session.id,
      paymentUrl: session.url!,
    };
  }

  verifySignature(payload: any, signature: string): any {
    try {
      // console.log("****************************************");
      // console.log(signature);
      // console.log(payload);
      // console.log(env.STRIPE_WEBHOOK_SECRET);
      // console.log("****************************************");
      const event = this._stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
      return event;
    } catch (err: any) {
      console.error("[Stripe Payment Adapter Error]", err.message);
      throw err;
    }
  }
}
