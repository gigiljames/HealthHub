export interface IForgotPasswordVerifyOtpUsecase {
  execute(otp: string, email: string): string;
}
