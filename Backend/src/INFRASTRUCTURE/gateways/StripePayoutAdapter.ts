import { IPayoutGateway } from "../../domain/interfaces/gateways/IPayoutGateway";

export class StripePayoutAdapter implements IPayoutGateway {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async transferFunds(
    accountId: string,
    amount: number,
    currency: string,
  ): Promise<{ gatewayRef: string }> {
    return {
      gatewayRef: `tr_mock_${Date.now()}`,
    };
  }
}
