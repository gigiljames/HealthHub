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
  sendOrganizationApprovedEmail(
    email: string,
    name: string,
    code: string,
  ): Promise<void>;
  sendOrganizationRejectedEmail(
    email: string,
    name: string,
    reason: string,
  ): Promise<void>;
  sendDisputeStatusEmail(
    email: string,
    name: string,
    disputeId: string,
    status: string,
    resolutionMessage?: string,
  ): Promise<void>;
  sendBookingDisabledEmail(
    email: string,
    name: string,
    role: string,
    reason: string,
  ): Promise<void>;
  sendBookingEnabledEmail(
    email: string,
    name: string,
    role: string,
  ): Promise<void>;
  sendAccountSuspendedEmail(
    email: string,
    name: string,
    role: string,
    reason: string,
    duration: number,
    endDate: Date,
  ): Promise<void>;
  sendAccountBannedEmail(
    email: string,
    name: string,
    role: string,
    reason: string,
  ): Promise<void>;
  sendSuspensionReminderEmail(
    email: string,
    name: string,
    role: string,
    endDateStr: string,
  ): Promise<void>;
  sendAccountReactivatedEmail(
    email: string,
    name: string,
    role: string,
  ): Promise<void>;
}
