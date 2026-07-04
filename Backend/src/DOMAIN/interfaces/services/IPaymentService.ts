export interface IPaymentService {
  createIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<{ gatewayRef: string; paymentUrl: string }>;
  verifySignature(payload: Buffer | string, signature: string): object;
}
