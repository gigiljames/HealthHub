export interface IOtpService {
  generateOtp(email: string, length?: number): string;
  storeOtp(otp: string, email: string): void;
  verifyOtp(otp: string, email: string): boolean;
}
