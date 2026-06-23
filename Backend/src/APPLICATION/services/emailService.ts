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

  async sendOrganizationApprovedEmail(
    email: string,
    name: string,
    code: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Registration Approved!</h2>
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your organization registration request on HealthHub has been approved by the admin team.</p>
        <p>Your unique 6-character organization code is:</p>
        <div style="display: inline-block; padding: 12px 24px; font-size: 24px; font-weight: bold; background-color: #f1f8e9; border: 2px dashed #4CAF50; color: #2e7d32; border-radius: 4px; letter-spacing: 2px; margin: 15px 0;">
          ${code}
        </div>
        <p>Doctors can now use this code to search and select your organization when configuring their practice locations.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Organization Registration Approved",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendOrganizationRejectedEmail(
    email: string,
    name: string,
    reason: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #d9534f;">Registration Rejected</h2>
        <p>Dear ${name},</p>
        <p>We regret to inform you that your organization registration request on HealthHub has been rejected by the admin team.</p>
        <p><strong>Rejection Reason:</strong></p>
        <blockquote style="background-color: #ffebee; border-left: 5px solid #d9534f; padding: 12px 20px; margin: 15px 0; color: #c62828;">
          ${reason}
        </blockquote>
        <p>You can edit and resubmit your details using the Organization Status Check page on our portal.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Organization Registration Rejected",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendDisputeStatusEmail(
    email: string,
    name: string,
    disputeId: string,
    status: string,
    resolutionMessage?: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2>Dispute Report Status Update</h2>
        <p>Dear ${name},</p>
        <p>We are writing to let you know that the status of your reported issue (ID: <strong>${disputeId}</strong>) has changed to: <span style="font-weight: bold; color: #2196F3;">${status}</span>.</p>
        ${
          resolutionMessage
            ? `<div style="background-color: #f5f5f5; border-left: 5px solid #4CAF50; padding: 12px 20px; margin: 15px 0;">
                 <strong>Resolution Message from Admins:</strong>
                 <p style="margin-top: 5px; font-style: italic;">"${resolutionMessage}"</p>
               </div>`
            : ""
        }
        <p>Thank you for helping us maintain a safe and supportive community on HealthHub.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: `HealthHub - Dispute Status Updated [${status}]`,
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendBookingDisabledEmail(
    email: string,
    name: string,
    role: string,
    reason: string,
  ): Promise<void> {
    const isDoctor = role === "doctor";
    const detailWording = isDoctor
      ? "As a healthcare provider on HealthHub, your slots scheduling and patient booking privileges have been disabled by the administration. Your profile will also be hidden from search results."
      : "As a patient on HealthHub, your booking privileges have been restricted by the administration. You will not be able to lock slots or book new doctor consultations.";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #d9534f;">New Bookings Restricted</h2>
        <p>Dear ${name},</p>
        <p>${detailWording}</p>
        <blockquote style="background-color: #ffebee; border-left: 5px solid #d9534f; padding: 12px 20px; margin: 15px 0; color: #c62828;">
          <strong>Reason:</strong> ${reason}
        </blockquote>
        <p>Any existing bookings will remain active. However, you will not be able to schedule or accept new bookings until this restriction is lifted.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Booking Restriction Notice",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendAccountSuspendedEmail(
    email: string,
    name: string,
    role: string,
    reason: string,
    duration: number,
    endDate: Date,
  ): Promise<void> {
    const endDateStr = endDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const isDoctor = role === "doctor";
    const detailWording = isDoctor
      ? "We regret to inform you that your doctor account has been temporarily suspended. Patients will not be able to book slot sessions with you, and your profile is hidden from search."
      : "We regret to inform you that your patient account has been temporarily suspended. Your login access is blocked and any upcoming appointments have been cancelled and refunded.";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #d9534f;">Account Temporarily Suspended</h2>
        <p>Dear ${name},</p>
        <p>${detailWording}</p>
        <blockquote style="background-color: #ffebee; border-left: 5px solid #d9534f; padding: 12px 20px; margin: 15px 0; color: #c62828;">
          <strong>Reason:</strong> ${reason}
        </blockquote>
        <p><strong>Suspension Details:</strong></p>
        <ul>
          <li>Duration: ${duration} Days</li>
          <li>End Date: ${endDateStr}</li>
          <li>Login Access: Blocked</li>
          <li>Bookings status: ${isDoctor ? "Future slots hidden/removed" : "Cancelled and refunded to wallet"}</li>
        </ul>
        <p>Your account privileges will be automatically reactivated on ${endDateStr}.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Temporary Account Suspension Notice",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendAccountBannedEmail(
    email: string,
    name: string,
    role: string,
    reason: string,
  ): Promise<void> {
    const isDoctor = role === "doctor";
    const detailWording = isDoctor
      ? "We are writing to inform you that your HealthHub provider contract and doctor account have been permanently banned due to severe policy violations. Your profile has been removed from provider listings."
      : "We are writing to inform you that your HealthHub patient account has been permanently banned from the platform due to policy violations. You will no longer be able to log in or schedule appointments.";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #d9534f;">Account Permanently Banned</h2>
        <p>Dear ${name},</p>
        <p>${detailWording}</p>
        <blockquote style="background-color: #ffebee; border-left: 5px solid #d9534f; padding: 12px 20px; margin: 15px 0; color: #c62828;">
          <strong>Reason for Ban:</strong> ${reason}
        </blockquote>
        <p>All upcoming bookings have been cancelled. Historical medical records remain preserved under compliance regulations, but all system access is terminated.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Permanent Account Ban Notice",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendSuspensionReminderEmail(
    email: string,
    name: string,
    role: string,
    endDateStr: string,
  ): Promise<void> {
    const isDoctor = role === "doctor";
    const detailWording = isDoctor
      ? "This is a reminder that your provider account suspension will end tomorrow. Your scheduling privileges and search visibility will be automatically reactivated."
      : "This is a reminder that your patient account suspension will end tomorrow. Your login privileges will be restored, and you can resume booking medical consultations.";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2>Reactivation Reminder</h2>
        <p>Dear ${name},</p>
        <p>${detailWording}</p>
        <p>Reactivation will occur on <strong>${endDateStr}</strong>. If you have questions, please reach out to HealthHub Support.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Account Reactivation Reminder",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendAccountReactivatedEmail(
    email: string,
    name: string,
    role: string,
  ): Promise<void> {
    const isDoctor = role === "doctor";
    const detailWording = isDoctor
      ? "We are pleased to inform you that your temporary suspension has ended, and your doctor account has been successfully reactivated. You can now log in, configure your slots, and offer consultation rooms."
      : "We are pleased to inform you that your temporary suspension has ended, and your patient account has been successfully reactivated. You can now log in and book consultation slots normally.";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Account Reactivated!</h2>
        <p>Dear ${name},</p>
        <p>${detailWording}</p>
        <p>Welcome back!</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Account Reactivation Notice",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }

  async sendBookingEnabledEmail(
    email: string,
    name: string,
    role: string,
  ): Promise<void> {
    const isDoctor = role === "doctor";
    const detailWording = isDoctor
      ? "As a healthcare provider on HealthHub, your slots scheduling and booking privileges have been fully restored. Patients can now search and book slots with you."
      : "As a patient on HealthHub, your booking privileges have been fully restored. You can now schedule appointments and consult with doctors normally.";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Booking Restriction Lifted</h2>
        <p>Dear ${name},</p>
        <p>${detailWording}</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>HealthHub Team</strong></p>
      </div>
    `;
    const mailOptions: nodemailer.SendMailOptions = {
      from: env.NODEMAILER_USER,
      to: email,
      subject: "HealthHub - Booking Restriction Lifted Notice",
      html,
    };
    await this._transporter.sendMail(mailOptions);
  }
}
