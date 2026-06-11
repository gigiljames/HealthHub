export interface SpecializationBreakdownDTO {
  specialization: string;
  count: number;
}

export interface DoctorBreakdownDTO {
  doctorName: string;
  count: number;
}

export interface ModeBreakdownDTO {
  mode: string;
  count: number;
}

export interface LocationBreakdownDTO {
  locationName: string;
  count: number;
}

export interface GetUserAnalyticsResponseDTO {
  totalConsultations: number;
  completedConsultations: number;
  cancelledConsultations: number;
  noShowCount: number;
  onlineConsultations: number;
  offlineConsultations: number;
  averageDuration: number;
  breakdown: {
    bySpecialization: SpecializationBreakdownDTO[];
    byDoctor: DoctorBreakdownDTO[];
    byMode: ModeBreakdownDTO[];
    byLocation: LocationBreakdownDTO[];
  };
}

export interface IGetUserAnalyticsUsecase {
  execute(userId: string): Promise<GetUserAnalyticsResponseDTO>;
}
