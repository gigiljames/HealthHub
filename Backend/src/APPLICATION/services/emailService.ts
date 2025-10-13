import { otpMailHtml } from "../../DOMAIN/constants/emailHtml/otpMailHtml";
import { IOtpEmailTemplate } from "../../DOMAIN/interfaces/emailTemplates/IOtpEmailTemplate";
import { IEmailService } from "../../DOMAIN/interfaces/services/IEmailService";
import nodemailer from "nodemailer";

export class EmailService implements IEmailService {
  private _transporter: nodemailer.Transporter;
  constructor() {
    this._transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });
  }
  async sendOtp(template: IOtpEmailTemplate): Promise<void> {
    const html = otpMailHtml(template.name, template.otp, template.body);
    const verify = await this._transporter.verify();
    if (!verify) {
      throw new Error("Error verifying nodemail transporter.");
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.NODEMAILER_USER,
      to: template.email,
      subject: template.subject,
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }
}
