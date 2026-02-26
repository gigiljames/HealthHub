import { IPaymentGateway } from "../../domain/interfaces/gateways/IPaymentGateway";

export class StripePaymentAdapter implements IPaymentGateway {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async createIntent(
    amount: number,
    currency: string,
    metadata: any,
  ): Promise<{ gatewayRef: string; paymentUrl: string }> {
    return {
      gatewayRef: `pi_mock_${Date.now()}`,
      paymentUrl: `https://checkout.stripe.mock/pay/${Date.now()}`,
    };
  }

  verifySignature(payload: any, signature: string): boolean {
    return true;
  }
}
