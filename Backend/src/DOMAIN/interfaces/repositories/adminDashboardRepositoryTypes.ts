export interface DemographicRaw {
  label: string;
  count: number;
}

export interface SpecializationTrendRaw {
  name: string;
  count: number;
}

export interface RegistrationTrendRaw {
  _id: string;
  patients: number;
  doctors: number;
}

export interface OrganizationTrendRaw {
  _id: string;
  count: number;
}

export interface AppointmentTrendRaw {
  _id: string;
  total: number;
}

export interface RevenueTrendRaw {
  _id: string;
  revenue: number;
}
