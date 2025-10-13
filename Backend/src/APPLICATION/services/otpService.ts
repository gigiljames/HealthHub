import { ICachingService } from "../../DOMAIN/interfaces/services/ICachingService";
import { IOtpService } from "../../DOMAIN/interfaces/services/IOtpService";

export class OtpService implements IOtpService {
  constructor(private _cachingService: ICachingService) {}
  generateOtp(email: string, length: number = 6): string {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    this.storeOtp(otp, email);
    console.log(otp);
    return otp;
  }
  storeOtp(otp: string, email: string): void {
    this._cachingService.setData(`user-otp-${email}`, otp, 300);
  }
  verifyOtp(otp: string, email: string): boolean {
    return this._cachingService.getData(`user-otp-${email}`) === otp;
  }
}
