export interface ISendOtpUsecase {
  execute(name: string, email: string): Promise<void>;
}
