export interface AppointmentSummaryDTO {
  doctorName: string;
  doctorProfilePictureUrl: string;
  specializationName: string;
  slotStartTime: Date;
  slotEndTime: Date;
  slotMode: string;
  practiceLocationName: string;
  location: string;
  consultationFee: number;
  availableOnlineModes: string[];
  platformFee: number;
  tax: number;
  totalAmount: number;
}
