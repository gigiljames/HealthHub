import { otpMailHtml } from "../../domain/constants/emailHtml/otpMailHtml";
import { IOtpEmailTemplate } from "../../domain/interfaces/emailTemplates/IOtpEmailTemplate";
import { IEmailService } from "../../domain/interfaces/services/IEmailService";
import nodemailer from "nodemailer";
import { env } from "../../config/envConfig";

export class EmailService implements IEmailService {
  private _transporter: nodemailer.Transporter;
  constructor() {
    this._transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.NODEMAILER_USER,
        pass: env.NODEMAILER_PASS,
      },
    });
  }
  async sendOtp(template: IOtpEmailTemplate): Promise<void> {
    const html = otpMailHtml(template.name, template.otp, template.body ?? "");
    const verify = await this._transporter.verify();
    if (!verify) {
      throw new Error("Error verifying nodemail transporter.");
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: template.email,
      subject: template.subject,
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }
}
