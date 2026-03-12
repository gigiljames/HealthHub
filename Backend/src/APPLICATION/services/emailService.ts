import { otpMailHtml } from "../../domain/constants/emailHtml/otpMailHtml";
import { passwordChangedMailHtml } from "../../domain/constants/emailHtml/passwordChangedMailHtml";
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

  async sendPasswordChangedEmail(email: string, name: string): Promise<void> {
    const html = passwordChangedMailHtml(name);
    const verify = await this._transporter.verify();
    if (!verify) {
      throw new Error("Error verifying nodemail transporter.");
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Password Changed Successfully",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendAppointmentCancellationEmail(
    email: string,
    name: string,
    appointmentTime: string,
    reason: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #d9534f;">Appointment Cancelled</h2>
        <p>Dear ${name},</p>
        <p>We are writing to inform you that your upcoming appointment scheduled for <strong>${appointmentTime}</strong> has been cancelled by the doctor.</p>
        <p><strong>Reason provided:</strong> ${reason}</p>
        <p>A full 100% refund has been initiated to your wallet. We apologize for any inconvenience this may cause.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const verify = await this._transporter.verify();
    if (!verify) {
      throw new Error("Error verifying nodemail transporter.");
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Appointment Cancellation Notice",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }
}
