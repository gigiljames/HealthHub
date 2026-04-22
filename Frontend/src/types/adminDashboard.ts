export const TimePeriod = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type TimePeriod = (typeof TimePeriod)[keyof typeof TimePeriod];

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

export interface RegistrationTrend {
  label: string;
  timestamp: string;
  patients: number;
  doctors: number;
  organizations: number;
}

export interface AppointmentTrend {
  label: string;
  timestamp: string;
  total: number;
}

export interface RevenueTrend {
  label: string;
  timestamp: string;
  revenue: number;
}

export interface AdminDashboardDTO {
  users: {
    totalPatients: number;
    totalDoctors: number;
    totalOrganizations: number;
    registrationTrend: RegistrationTrend[];
    patientGenderDemographics: DemographicsData[];
    doctorGenderDemographics: DemographicsData[];
    patientAgeDemographics: DemographicsData[];
    doctorAgeDemographics: DemographicsData[];
    specializationStats: SpecializationData[];
  };
  appointments: {
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
  };
  finance: {
    totalRevenue: number;
    averageRevenuePerUser: number;
    doctorPayoutsCount: number;
    doctorPayoutsAmount: number;
    pendingPayoutsCount: number;
    pendingPayoutsAmount: number;
    adminWalletBalance: number;
    revenueTrend: RevenueTrend[];
  };
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    startDate: string;
    endDate: string;
  };
}
