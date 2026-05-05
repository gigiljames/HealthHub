import { otpMailHtml } from "../../domain/constants/emailHtml/otpMailHtml";
import { passwordChangedMailHtml } from "../../domain/constants/emailHtml/passwordChangedMailHtml";
import { IOtpEmailTemplate } from "../../domain/interfaces/emailTemplates/IOtpEmailTemplate";
import { IEmailService } from "../../domain/interfaces/services/IEmailService";
import nodemailer from "nodemailer";
import { env } from "../../config/envConfig";
import { CustomError } from "../../domain/entities/customError";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../domain/constants/messages";

export class EmailService implements IEmailService {
  private readonly _transporter: nodemailer.Transporter;
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
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.NODEMAILER_ERROR,
      );
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
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.NODEMAILER_ERROR,
      );
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
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.NODEMAILER_ERROR,
      );
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Appointment Cancellation Notice",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendAppointmentBookedEmail(
    email: string,
    name: string,
    doctorName: string,
    appointmentTime: string,
    mode: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Appointment Confirmed</h2>
        <p>Dear ${name},</p>
        <p>Your appointment with <strong>${doctorName}</strong> has been successfully booked.</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Mode:</strong> ${mode}</p>
        <br/>
        <p>You can view and manage your appointments from your HealthHub dashboard.</p>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Appointment Confirmed",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendAppointmentReminderEmail(
    email: string,
    name: string,
    doctorName: string,
    appointmentTime: string,
    mode: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #FF9800;">Appointment Reminder</h2>
        <p>Dear ${name},</p>
        <p>This is a reminder that you have an upcoming appointment with <strong>${doctorName}</strong> in 30 minutes.</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Mode:</strong> ${mode}</p>
        <br/>
        <p>Please be ready a few minutes early.</p>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Appointment Reminder",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendConsultationJoinedEmail(
    email: string,
    name: string,
    doctorName: string,
    joinLink: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2196F3;">Doctor is Waiting!</h2>
        <p>Dear ${name},</p>
        <p><strong>${doctorName}</strong> has joined the consultation room and is waiting for you.</p>
        <br/>
        <a href="${joinLink}" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">Join Consultation Now</a>
        <br/><br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Doctor has joined the consultation",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }
}
