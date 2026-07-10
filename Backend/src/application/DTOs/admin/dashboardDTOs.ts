export interface TimeSeriesData {
  label: string;
  timestamp: Date;
  [key: string]: string | number | object;
}

export interface RegistrationTrend extends TimeSeriesData {
  patients: number;
  doctors: number;
  organizations: number;
}

export interface AppointmentTrend extends TimeSeriesData {
  total: number;
}

export interface RevenueTrend extends TimeSeriesData {
  revenue: number;
}

export interface DemographicsData {
  label: string;
  count: number;
  percentage: number;
}

export interface SpecializationData {
  name: string;
  count: number;
  percentage: number;
}

export interface UserStatsDTO {
  totalPatients: number;
  totalDoctors: number;
  totalOrganizations: number;
  registrationTrend: RegistrationTrend[];
  patientGenderDemographics: DemographicsData[];
  doctorGenderDemographics: DemographicsData[];
  patientAgeDemographics: DemographicsData[];
  doctorAgeDemographics: DemographicsData[];
  specializationStats: SpecializationData[];
}

export interface AppointmentStatsDTO {
  totalBooked: number;
  totalCompleted: number;
  completionRate: number;
  totalCancelled: number;
  cancellationRate: number;
  totalNoShow: number;
  noShowRate: number;
  averageDuration: number;
  appointmentTrend: AppointmentTrend[];
  modeDistribution: DemographicsData[];
}

export interface FinanceStatsDTO {
  totalRevenue: number;
  averageRevenuePerUser: number;
  doctorPayoutsCount: number;
  doctorPayoutsAmount: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  adminWalletBalance: number;
  revenueTrend: RevenueTrend[];
}

export interface AdminDashboardDTO {
  users: UserStatsDTO;
  appointments: AppointmentStatsDTO;
  finance: FinanceStatsDTO;
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    startDate?: Date;
    endDate?: Date;
  };
}
