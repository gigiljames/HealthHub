import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { DoctorAnalysisDTO } from "../../DTOs/doctor/doctorAnalysisDTO";
import { TimePeriod } from "../../../domain/enums/timePeriod";

import { IGetDoctorAnalysisUseCase } from "../../../domain/interfaces/usecases/doctor/IGetDoctorAnalysisUseCase";

const getISOWeekDetails = (date: Date): { year: number; week: number } => {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
  return { year: target.getFullYear(), week: weekNumber };
};

const formatInKolkata = (date: Date, formatStr: "daily" | "weekly" | "monthly" | "yearly"): string => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const yyyy = partMap.year;
  const mm = partMap.month;
  const dd = partMap.day;

  if (formatStr === "daily") {
    return `${yyyy}-${mm}-${dd}`;
  }
  if (formatStr === "monthly") {
    return `${yyyy}-${mm}`;
  }
  if (formatStr === "yearly") {
    return `${yyyy}`;
  }
  if (formatStr === "weekly") {
    const kolkataDate = new Date(Date.UTC(
      parseInt(yyyy, 10),
      parseInt(mm, 10) - 1,
      parseInt(dd, 10),
      12,
    ));
    const { year: isoYear, week: isoWeek } = getISOWeekDetails(kolkataDate);
    return `${isoYear}-W${String(isoWeek).padStart(2, "0")}`;
  }
  return "";
};

const generateDailyLabels = (start: Date, end: Date): string[] => {
  const labels: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    labels.push(formatInKolkata(current, "daily"));
    current.setDate(current.getDate() + 1);
  }
  return labels;
};

const generateWeeklyLabels = (start: Date, end: Date): string[] => {
  const labelsSet = new Set<string>();
  const current = new Date(start);
  while (current <= end) {
    labelsSet.add(formatInKolkata(current, "weekly"));
    current.setDate(current.getDate() + 7);
  }
  labelsSet.add(formatInKolkata(end, "weekly"));
  return Array.from(labelsSet).sort();
};

const generateMonthlyLabels = (start: Date, end: Date): string[] => {
  const labels: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    labels.push(formatInKolkata(current, "monthly"));
    current.setMonth(current.getMonth() + 1);
  }
  return labels;
};

const generateYearlyLabels = (start: Date, end: Date): string[] => {
  const labels: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    labels.push(formatInKolkata(current, "yearly"));
    current.setFullYear(current.getFullYear() + 1);
  }
  return labels;
};

export class GetDoctorAnalysisUseCase implements IGetDoctorAnalysisUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) { }

  async execute(
    doctorId: string,
    locationId: string | null,
    period: TimePeriod,
    duration?: number,
  ): Promise<DoctorAnalysisDTO> {
    const X = duration || (
      period === TimePeriod.DAILY ? 7 :
        period === TimePeriod.WEEKLY ? 12 :
          period === TimePeriod.MONTHLY ? 12 :
            5
    );

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (period) {
      case TimePeriod.DAILY:
        startDate.setDate(startDate.getDate() - (X - 1));
        break;
      case TimePeriod.WEEKLY:
        startDate.setDate(startDate.getDate() - (X * 7 - 1));
        break;
      case TimePeriod.MONTHLY:
        startDate.setMonth(startDate.getMonth() - (X - 1));
        startDate.setDate(1);
        break;
      case TimePeriod.YEARLY:
        startDate.setFullYear(startDate.getFullYear() - (X - 1));
        startDate.setMonth(0, 1);
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

    let expectedLabels: string[] = [];
    if (period === TimePeriod.DAILY) {
      expectedLabels = generateDailyLabels(startDate, endDate);
    } else if (period === TimePeriod.WEEKLY) {
      expectedLabels = generateWeeklyLabels(startDate, endDate);
    } else if (period === TimePeriod.MONTHLY) {
      expectedLabels = generateMonthlyLabels(startDate, endDate);
    } else if (period === TimePeriod.YEARLY) {
      expectedLabels = generateYearlyLabels(startDate, endDate);
    }

    const trendMap = new Map<string, number>();
    if (rawData.appointmentTrend) {
      for (const item of rawData.appointmentTrend) {
        if (item._id) {
          trendMap.set(item._id, item.total);
        }
      }
    }

    const appointmentTrend = expectedLabels.map((label) => ({
      label,
      timestamp: new Date(),
      total: trendMap.get(label) || 0,
    }));

    const modeDistribution =
      rawData.modeDistribution?.map((item: {
        _id: string;
        count: number;
      }) => ({
        label: item._id || "Unknown",
        count: item.count,
        percentage:
          totalAppointments > 0 ? (item.count / totalAppointments) * 100 : 0,
      })) || [];

    const locationDistribution = locationId
      ? undefined
      : rawData.locationDistribution?.map((item: {
        _id: string;
        count: number;
      }) => ({
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
