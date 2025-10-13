import { IOtpEmailTemplate } from "../emailTemplates/IOtpEmailTemplate";

export interface IEmailService {
  sendOtp(template: IOtpEmailTemplate): Promise<void>;
}
