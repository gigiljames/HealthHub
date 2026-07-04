export interface ISendStatusOtpUsecase {
  execute(email: string): Promise<void>;
}
