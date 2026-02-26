export interface IPayoutGateway {
  transferFunds(
    accountId: string,
    amount: number,
    currency: string,
  ): Promise<{ gatewayRef: string }>;
}
