export interface TimeSeriesData {
  label: string;
  timestamp: Date;
  [key: string]: any;
}

export interface AppointmentTrend extends TimeSeriesData {
  total: number;
}

export interface DemographicsData {
  label: string;
  count: number;
  percentage: number;
}

export interface LocationDistributionData {
  name: string;
  count: number;
  percentage: number;
}

export interface DoctorAnalysisDTO {
  totalAppointments: number;
  totalCompleted: number;
  cancellationRate: number;
  cancelledByUser: number;
  cancelledByDoctor: number;
  totalNoShow: number;
  noShowRate: number;
  totalPatients: number;
  totalHours: number;
  totalRevenue?: number;
  paymentReceived?: number;
  appointmentTrend: AppointmentTrend[];
  modeDistribution: DemographicsData[];
  locationDistribution?: LocationDistributionData[];
}
