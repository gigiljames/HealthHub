import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { DoctorAnalysisDTO } from "../../../domain/dtos/doctorAnalysisDTO";
import { TimePeriod } from "../../../domain/enums/timePeriod";

import { IGetDoctorAnalysisUseCase } from "../../../domain/interfaces/usecases/doctor/IGetDoctorAnalysisUseCase";

export class GetDoctorAnalysisUseCase implements IGetDoctorAnalysisUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(
    doctorId: string,
    locationId: string | null,
    period: TimePeriod,
  ): Promise<DoctorAnalysisDTO> {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case TimePeriod.DAILY:
        startDate.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.WEEKLY:
        startDate.setDate(startDate.getDate() - 7);
        break;
      case TimePeriod.MONTHLY:
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case TimePeriod.YEARLY:
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const rawData = await this.appointmentRepository.getDoctorAnalysisData(
      doctorId,
      locationId,
      startDate,
      endDate,
      period,
    );

    if (!rawData) {
      return {
        totalAppointments: 0,
        totalCompleted: 0,
        cancellationRate: 0,
        cancelledByUser: 0,
        cancelledByDoctor: 0,
        totalNoShow: 0,
        noShowRate: 0,
        totalPatients: 0,
        totalHours: 0,
        totalRevenue: 0,
        paymentReceived: 0,
        appointmentTrend: [],
        modeDistribution: [],
        locationDistribution: locationId ? undefined : [],
      };
    }

    const totals =
      rawData.totals && rawData.totals.length > 0 ? rawData.totals[0] : null;

    const totalAppointments = totals?.totalAppointments || 0;
    const totalCompleted = totals?.totalCompleted || 0;
    const cancelledByUser = totals?.cancelledByUser || 0;
    const cancelledByDoctor = totals?.cancelledByDoctor || 0;
    const totalCancelled = cancelledByUser + cancelledByDoctor;
    const totalNoShow = totals?.totalNoShow || 0;

    const cancellationRate =
      totalAppointments > 0 ? (totalCancelled / totalAppointments) * 100 : 0;
    const noShowRate =
      totalAppointments > 0 ? (totalNoShow / totalAppointments) * 100 : 0;

    const uniquePatientsCount = totals?.uniquePatients?.length || 0;
    const totalHours = totals?.totalDurationMinutes
      ? Number((totals.totalDurationMinutes / 60).toFixed(2))
      : 0;

    const appointmentTrend =
      rawData.appointmentTrend?.map((item: any) => ({
        label: item._id,
        timestamp: new Date(),
        total: item.total,
      })) || [];

    const modeDistribution =
      rawData.modeDistribution?.map((item: any) => ({
        label: item._id || "Unknown",
        count: item.count,
        percentage:
          totalAppointments > 0 ? (item.count / totalAppointments) * 100 : 0,
      })) || [];

    const locationDistribution = locationId
      ? undefined
      : rawData.locationDistribution?.map((item: any) => ({
          name: item._id || "Unknown",
          count: item.count,
          percentage:
            totalAppointments > 0 ? (item.count / totalAppointments) * 100 : 0,
        })) || [];

    const response: DoctorAnalysisDTO = {
      totalAppointments,
      totalCompleted,
      cancellationRate,
      cancelledByUser,
      cancelledByDoctor,
      totalNoShow,
      noShowRate,
      totalPatients: uniquePatientsCount,
      totalHours,
      appointmentTrend,
      modeDistribution,
    };
    response.totalRevenue = totals?.totalRevenue || 0;
    response.paymentReceived = totals?.paymentReceived || 0;

    if (!locationId) {
      response.locationDistribution = locationDistribution;
    }
    return response;
  }
}
