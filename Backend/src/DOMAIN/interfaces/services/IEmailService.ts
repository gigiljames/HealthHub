import { IOtpEmailTemplate } from "../emailTemplates/IOtpEmailTemplate";

export interface IEmailService {
  sendOtp(template: IOtpEmailTemplate): Promise<void>;
  sendPasswordChangedEmail(email: string, name: string): Promise<void>;
  sendAppointmentCancellationEmail(
    email: string,
    name: string,
    appointmentTime: string,
    reason: string,
  ): Promise<void>;
  sendAppointmentBookedEmail(
    email: string,
    name: string,
    doctorName: string,
    appointmentTime: string,
    mode: string,
  ): Promise<void>;
  sendAppointmentReminderEmail(
    email: string,
    name: string,
    doctorName: string,
    appointmentTime: string,
    mode: string,
  ): Promise<void>;
  sendConsultationJoinedEmail(
    email: string,
    name: string,
    doctorName: string,
    joinLink: string,
  ): Promise<void>;
}
