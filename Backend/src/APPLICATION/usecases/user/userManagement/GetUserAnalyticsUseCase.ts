import { IUserAnalyticsRepository } from "../../../../domain/interfaces/repositories/IUserAnalyticsRepository";
import {
  IGetUserAnalyticsUsecase,
  GetUserAnalyticsResponseDTO,
  SpecializationBreakdownDTO,
  DoctorBreakdownDTO,
  ModeBreakdownDTO,
  LocationBreakdownDTO,
} from "../../../../domain/interfaces/usecases/user/userManagement/IGetUserAnalyticsUsecase";
import { AppointmentStatus } from "../../../../domain/enums/appointmentStatus";

export class GetUserAnalyticsUseCase implements IGetUserAnalyticsUsecase {
  constructor(private readonly _userAnalyticsRepository: IUserAnalyticsRepository) {}

  async execute(userId: string): Promise<GetUserAnalyticsResponseDTO> {
    const data = await this._userAnalyticsRepository.getUserAppointmentsForAnalytics(userId);

    const totalConsultations = data.length;

    // Filter statuses
    const completed = data.filter((d) => d.status === AppointmentStatus.COMPLETED);
    const completedConsultations = completed.length;

    const cancelled = data.filter(
      (d) =>
        d.status === AppointmentStatus.CANCELLED ||
        d.status === AppointmentStatus.CANCELLED_BY_USER ||
        d.status === AppointmentStatus.CANCELLED_BY_DOCTOR
    );
    const cancelledConsultations = cancelled.length;

    const noShowCount = data.filter((d) => d.status === AppointmentStatus.NO_SHOW).length;

    // Modes
    const onlineConsultations = data.filter((d) => d.slotMode === "online").length;
    const offlineConsultations = data.filter((d) => d.slotMode === "in-person").length;

    // Average duration of completed consultations in minutes
    let averageDuration = 0;
    if (completedConsultations > 0) {
      let totalDurationMs = 0;
      completed.forEach((d) => {
        totalDurationMs += d.slotEnd.getTime() - d.slotStart.getTime();
      });
      averageDuration = Math.round(totalDurationMs / completedConsultations / (1000 * 60));
    }

    // Breakdown aggregations
    const specCounts: Record<string, number> = {};
    const docCounts: Record<string, number> = {};
    const modeCounts: Record<string, number> = {};
    const locCounts: Record<string, number> = {};

    data.forEach((d) => {
      // Specialization
      const spec = d.specializationName || "General Medicine";
      specCounts[spec] = (specCounts[spec] || 0) + 1;

      // Doctor
      const doc = d.doctorName || "Doctor";
      docCounts[doc] = (docCounts[doc] || 0) + 1;

      // Mode
      const modeText = d.slotMode === "online" ? "Online" : "In-Person";
      modeCounts[modeText] = (modeCounts[modeText] || 0) + 1;

      // Location
      const loc = d.practiceLocationName || "Online";
      locCounts[loc] = (locCounts[loc] || 0) + 1;
    });

    // Map and sort breakdowns descending by count
    const bySpecialization: SpecializationBreakdownDTO[] = Object.keys(specCounts)
      .map((k) => ({ specialization: k, count: specCounts[k] }))
      .sort((a, b) => b.count - a.count);

    const byDoctor: DoctorBreakdownDTO[] = Object.keys(docCounts)
      .map((k) => ({ doctorName: k, count: docCounts[k] }))
      .sort((a, b) => b.count - a.count);

    const byMode: ModeBreakdownDTO[] = Object.keys(modeCounts)
      .map((k) => ({ mode: k, count: modeCounts[k] }))
      .sort((a, b) => b.count - a.count);

    const byLocation: LocationBreakdownDTO[] = Object.keys(locCounts)
      .map((k) => ({ locationName: k, count: locCounts[k] }))
      .sort((a, b) => b.count - a.count);

    return {
      totalConsultations,
      completedConsultations,
      cancelledConsultations,
      noShowCount,
      onlineConsultations,
      offlineConsultations,
      averageDuration,
      breakdown: {
        bySpecialization,
        byDoctor,
        byMode,
        byLocation,
      },
    };
  }
}
