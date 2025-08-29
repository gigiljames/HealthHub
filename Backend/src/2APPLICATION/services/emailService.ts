import { otpMailHtml } from "../../1DOMAIN/constants/emailHtml/otpMailHtml";
import { IOtpEmailTemplate } from "../../1DOMAIN/interfaces/emailTemplates/IOtpEmailTemplate";
import { IEmailService } from "../../1DOMAIN/interfaces/services/IEmailService";
import nodemailer from "nodemailer";

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });
  }
  async sendOtp(template: IOtpEmailTemplate): Promise<void> {
    const html = otpMailHtml(template.name, template.otp);
    const verify = await this.transporter.verify();
    if (!verify) {
      throw new Error("Error verifying nodemail transporter.");
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.NODEMAILER_USER,
      to: template.email,
      subject: template.subject,
      html: html,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
