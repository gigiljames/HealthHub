export interface IPaymentService {
  createIntent(
    amount: number,
    currency: string,
    metadata: any,
  ): Promise<{ gatewayRef: string; paymentUrl: string }>;
  verifySignature(payload: any, signature: string): any;
}
