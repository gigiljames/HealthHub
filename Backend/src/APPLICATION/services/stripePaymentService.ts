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
    metadata: Record<string, string>,
  ): Promise<{ gatewayRef: string; paymentUrl: string }> {
    const isWallet = !!metadata.walletId;
    const productName = isWallet ? "Wallet Top-up" : `Order #${metadata.appointmentId}`;
    const successUrl = isWallet
      ? `${env.FRONTEND_URL}/wallet/topup/{CHECKOUT_SESSION_ID}/confirmation?status=success`
      : `${env.FRONTEND_URL}/appointments/{CHECKOUT_SESSION_ID}/confirmation?status=success`;
    const cancelUrl = isWallet
      ? `${env.FRONTEND_URL}/wallet/topup/{CHECKOUT_SESSION_ID}/confirmation?status=failure`
      : `${env.FRONTEND_URL}/appointments/{CHECKOUT_SESSION_ID}/confirmation?status=failure`;

    const session = await this._stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: productName },
            unit_amount: amount * 100, // amount in smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: metadata.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata,
    });
    return {
      gatewayRef: session.id,
      paymentUrl: session.url!,
    };
  }

  verifySignature(payload: Buffer | string, signature: string): object {
    try {
      const event = this._stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
      return event;
    } catch (err) {
      console.error("[Stripe Payment Adapter Error]");
      throw err;
    }
  }
}
