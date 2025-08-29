import { ICachingService } from "../../1DOMAIN/interfaces/services/ICachingService";
import { IOtpService } from "../../1DOMAIN/interfaces/services/IOtpService";

export class OtpService implements IOtpService {
  constructor(private cachingService: ICachingService) {}
  generateOtp(length: number = 6): string {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    this.storeOtp(otp);
    return otp;
  }
  storeOtp(otp: string): void {
    this.cachingService.setData("user-otp", otp, 300);
  }
  verifyOtp(otp: string): boolean {
    return this.cachingService.getData("user-otp") === otp;
  }
}
