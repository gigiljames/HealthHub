export interface IHandlePaymentFailureUsecase {
  execute(gatewayRef: string, reason: string): Promise<void>;
}
