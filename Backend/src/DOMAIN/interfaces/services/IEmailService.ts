import { IOtpEmailTemplate } from "../emailTemplates/IOtpEmailTemplate";

export interface IEmailService {
  sendOtp(template: IOtpEmailTemplate): Promise<void>;
  sendPasswordChangedEmail(email: string, name: string): Promise<void>;
}
