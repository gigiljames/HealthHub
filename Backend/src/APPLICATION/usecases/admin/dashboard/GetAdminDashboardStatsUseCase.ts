import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IUserProfileRepository } from "../../../../domain/interfaces/repositories/IUserProfileRepository";
import { IAppointmentRepository } from "../../../../domain/interfaces/repositories/IAppointmentRepository";
import { ITransactionRepository } from "../../../../domain/interfaces/repositories/ITransactionRepository";
import { IPayoutRepository } from "../../../../domain/interfaces/repositories/IPayoutRepository";
import { IWalletRepository } from "../../../../domain/interfaces/repositories/IWalletRepository";
import { IOrganizationRepository } from "../../../../domain/interfaces/repositories/IOrganizationRepository";
import { TimePeriod } from "../../../../domain/enums/timePeriod";
import { Roles } from "../../../../domain/enums/roles";
import { IGetAdminDashboardStatsUseCase } from "../../../interfaces/usecases/admin/IGetAdminDashboardStatsUseCase";
import { AdminDashboardDTO } from "../../../DTOs/admin/dashboardDTOs";
import { DashboardMapper } from "../../../mappers/admin/dashboardMapper";

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

export class GetAdminDashboardStatsUseCase implements IGetAdminDashboardStatsUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private doctorProfileRepository: IDoctorProfileRepository,
    private userProfileRepository: IUserProfileRepository,
    private appointmentRepository: IAppointmentRepository,
    private transactionRepository: ITransactionRepository,
    private payoutRepository: IPayoutRepository,
    private walletRepository: IWalletRepository,
    private organizationRepository: IOrganizationRepository,
  ) {}

  async execute(period: TimePeriod, page: number, duration?: number): Promise<AdminDashboardDTO> {
    const X = duration || (
      period === TimePeriod.DAILY ? 7 :
      period === TimePeriod.WEEKLY ? 12 :
      period === TimePeriod.MONTHLY ? 12 :
      5
    );

    const { startDate, endDate } = this.calculateDateRange(period, page, X);
    const earliestDate = await this.authRepository.getEarliestRecordDate();

    const [
      totalPatients,
      totalDoctors,
      totalOrganizations,
      regTrends,
      pGender,
      dGender,
      pAge,
      dAge,
      specStats,
    ] = await Promise.all([
      this.authRepository.countByRole(Roles.USER),
      this.authRepository.countByRole(Roles.DOCTOR),
      this.organizationRepository.countAll(),
      this.fetchRegistrationTrends(startDate, endDate, period),
      this.userProfileRepository.getGenderDemographics(),
      this.doctorProfileRepository.getGenderDemographics(),
      this.userProfileRepository.getAgeDemographics(),
      this.doctorProfileRepository.getAgeDemographics(),
      this.doctorProfileRepository.getSpecializationDistribution(),
    ]);

    const [aptStats, aptTrends, modeDist] = await Promise.all([
      this.appointmentRepository.getAppointmentStats(startDate, endDate),
      this.appointmentRepository.getAppointmentTrends(
        startDate,
        endDate,
        period,
      ),
      this.appointmentRepository.getModeDistribution(),
    ]);

    const adminWallet = await this.walletRepository.getWallets({
      role: Roles.ADMIN,
      limit: 1,
    });

    const [finStats, revTrends, payoutStats] = await Promise.all([
      this.transactionRepository.getFinancialStats(startDate, endDate),
      this.transactionRepository.getRevenueTrends(startDate, endDate, period),
      this.payoutRepository.getPayoutStats(startDate, endDate),
    ]);

    // Generate expected labels
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

    // Zero-fill registration trend
    const regMap = new Map<string, any>();
    regTrends.forEach((item) => {
      regMap.set(item.label, item);
    });
    const zeroFilledRegTrends = expectedLabels.map((label) => {
      const existing = regMap.get(label);
      let timestamp: Date;
      try {
        if (label.includes("-W")) {
          const [yr, wk] = label.split("-W");
          timestamp = new Date(parseInt(yr, 10), 0, 1 + (parseInt(wk, 10) - 1) * 7);
        } else {
          timestamp = new Date(label);
        }
      } catch {
        timestamp = new Date();
      }
      return {
        label,
        timestamp,
        patients: existing ? existing.patients : 0,
        doctors: existing ? existing.doctors : 0,
        organizations: existing ? existing.organizations : 0,
      };
    });

    // Zero-fill appointment trend
    const aptMap = new Map<string, number>();
    aptTrends.forEach((t) => {
      if (t._id) {
        aptMap.set(t._id, t.total);
      }
    });
    const zeroFilledAptTrends = expectedLabels.map((label) => {
      let timestamp: Date;
      try {
        if (label.includes("-W")) {
          const [yr, wk] = label.split("-W");
          timestamp = new Date(parseInt(yr, 10), 0, 1 + (parseInt(wk, 10) - 1) * 7);
        } else {
          timestamp = new Date(label);
        }
      } catch {
        timestamp = new Date();
      }
      return {
        label,
        timestamp,
        total: aptMap.get(label) || 0,
      };
    });

    // Zero-fill revenue trend
    const revMap = new Map<string, number>();
    revTrends.forEach((t) => {
      if (t._id) {
        revMap.set(t._id, t.revenue);
      }
    });
    const zeroFilledRevTrends = expectedLabels.map((label) => {
      let timestamp: Date;
      try {
        if (label.includes("-W")) {
          const [yr, wk] = label.split("-W");
          timestamp = new Date(parseInt(yr, 10), 0, 1 + (parseInt(wk, 10) - 1) * 7);
        } else {
          timestamp = new Date(label);
        }
      } catch {
        timestamp = new Date();
      }
      return {
        label,
        timestamp,
        revenue: revMap.get(label) || 0,
      };
    });

    return {
      users: {
        totalPatients,
        totalDoctors,
        totalOrganizations,
        registrationTrend: zeroFilledRegTrends,
        patientGenderDemographics: DashboardMapper.toDemographicsDTO(pGender),
        doctorGenderDemographics: DashboardMapper.toDemographicsDTO(dGender),
        patientAgeDemographics: DashboardMapper.toDemographicsDTO(pAge),
        doctorAgeDemographics: DashboardMapper.toDemographicsDTO(dAge),
        specializationStats: DashboardMapper.toSpecializationDTO(specStats),
      },
      appointments: {
        totalBooked: aptStats.totalBooked,
        totalCompleted: aptStats.totalCompleted,
        completionRate: DashboardMapper.calculateRate(
          aptStats.totalCompleted,
          aptStats.totalBooked,
        ),
        totalCancelled: aptStats.totalCancelled,
        cancellationRate: DashboardMapper.calculateRate(
          aptStats.totalCancelled,
          aptStats.totalBooked,
        ),
        totalNoShow: aptStats.totalNoShow,
        noShowRate: DashboardMapper.calculateRate(
          aptStats.totalNoShow,
          aptStats.totalBooked,
        ),
        averageDuration: aptStats.averageDuration,
        appointmentTrend: zeroFilledAptTrends,
        modeDistribution: DashboardMapper.toDemographicsDTO(modeDist),
      },
      finance: {
        totalRevenue: finStats.totalRevenue,
        averageRevenuePerUser:
          finStats.totalUserCount > 0
            ? finStats.totalRevenue / finStats.totalUserCount
            : 0,
        doctorPayoutsCount: payoutStats.doctorPayoutsCount,
        doctorPayoutsAmount: payoutStats.doctorPayoutsAmount,
        pendingPayoutsCount: payoutStats.pendingPayoutsCount,
        pendingPayoutsAmount: payoutStats.pendingPayoutsAmount,
        adminWalletBalance: adminWallet.wallets[0]?.balance ?? 0,
        revenueTrend: zeroFilledRevTrends,
      },
      pagination: {
        currentPage: page,
        hasNextPage: startDate > earliestDate,
        hasPrevPage: page > 1,
        startDate,
        endDate,
      },
    };
  }

  private calculateDateRange(
    period: TimePeriod,
    page: number,
    X: number,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case TimePeriod.DAILY:
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        endDate.setDate(endDate.getDate() - (page - 1) * X);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - X + 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.WEEKLY:
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        endDate.setDate(endDate.getDate() - (page - 1) * X * 7);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - X * 7 + 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.MONTHLY:
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          15,
          23,
          59,
          59,
          999,
        );
        endDate.setMonth(endDate.getMonth() - (page - 1) * X);
        endDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        startDate = new Date(endDate);
        startDate.setDate(1);
        startDate.setMonth(startDate.getMonth() - X + 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.YEARLY:
        endDate = new Date(
          now.getFullYear() - (page - 1) * X,
          11,
          31,
          23,
          59,
          59,
          999,
        );
        startDate = new Date(
          endDate.getFullYear() - X + 1,
          0,
          1,
          0,
          0,
          0,
          0,
        );
        break;
      default:
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7 + 1);
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  }

  private async fetchRegistrationTrends(
    startDate: Date,
    endDate: Date,
    period: TimePeriod,
  ): Promise<any[]> {
    const [authTrends, orgTrends] = await Promise.all([
      this.authRepository.getRegistrationTrends(startDate, endDate, period),
      this.organizationRepository.getRegistrationTrends(
        startDate,
        endDate,
        period,
      ),
    ]);

    const merged = new Map<string, any>();
    authTrends.forEach((t) =>
      merged.set(t._id, {
        label: t._id,
        timestamp: new Date(t._id),
        patients: t.patients,
        doctors: t.doctors,
        organizations: 0,
      }),
    );
    orgTrends.forEach((t) => {
      const existing = merged.get(t._id) || {
        label: t._id,
        timestamp: new Date(t._id),
        patients: 0,
        doctors: 0,
        organizations: 0,
      };
      existing.organizations = t.count;
      merged.set(t._id, existing);
    });

    return Array.from(merged.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }
}
