export interface IHandlePaymentFailureUsecase {
  execute(gatewayRef: string): Promise<void>;
}
