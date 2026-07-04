export interface UserAppointmentAnalyticsData {
  appointmentId: string;
  status: string;
  slotStart: Date;
  slotEnd: Date;
  slotMode: "online" | "in-person";
  practiceLocationId: string | null;
  practiceLocationName: string | null;
  doctorName: string;
  specializationName: string;
}

export interface IUserAnalyticsRepository {
  getUserAppointmentsForAnalytics(userId: string): Promise<UserAppointmentAnalyticsData[]>;
}
