export interface LocationAnalyticsDTO {
  locationId: string;
  locationName: string;
  totalConsultations: number;
  completedConsultations: number;
  completionRate: number;
  cancellationRate: number;
  averageDuration: number;
  activePatients: number;
  peakConsultationHour: string;
  peakBookingDay: string;
  averageRating: string;
  revenueGenerated: number;
  refundedAmount: number;
  onlineConsultations: number;
  offlineConsultations: number;
  averageConsultationsPerDay: number;
  averageConsultationsPerMonth: number;
  averageMonthlyRevenue: number;
  consultationModes: string[];
  googleMapsUrl: string | null;
}

export interface GetDoctorAnalyticsResponseDTO {
  analytics: LocationAnalyticsDTO[];
  combined?: LocationAnalyticsDTO;
}

export interface IGetDoctorAnalyticsUsecase {
  execute(doctorId: string): Promise<GetDoctorAnalyticsResponseDTO>;
}
