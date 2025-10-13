export interface IOtpEmailTemplate {
  name: string;
  email: string;
  otp: string;
  subject: string;
  body?: string;
}
