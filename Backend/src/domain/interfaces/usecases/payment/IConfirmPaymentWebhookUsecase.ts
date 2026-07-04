export interface IConfirmPaymentWebhookUsecase {
  execute(gatewayRef: string): Promise<void>;
}
