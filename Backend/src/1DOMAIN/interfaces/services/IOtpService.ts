export interface IOtpService {
  generateOtp(length?: number): string;
  storeOtp(otp: string): void;
  verifyOtp(otp: string): boolean;
}
