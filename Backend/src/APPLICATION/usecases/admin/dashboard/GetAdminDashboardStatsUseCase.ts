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

  async execute(period: TimePeriod, page: number): Promise<AdminDashboardDTO> {
    const { startDate, endDate } = this.calculateDateRange(period, page);
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

    return {
      users: {
        totalPatients,
        totalDoctors,
        totalOrganizations,
        registrationTrend: regTrends,
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
        appointmentTrend: aptTrends.map((t) => ({
          label: t._id,
          timestamp: new Date(t._id),
          total: t.total,
        })),
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
        revenueTrend: revTrends.map((t) => ({
          label: t._id,
          timestamp: new Date(t._id),
          revenue: t.revenue,
        })),
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
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7 * page + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 7 * (page - 1));
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
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7 * 8 * page + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 7 * 8 * (page - 1));
        break;
      case TimePeriod.MONTHLY:
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 12 * page + 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() - 12 * (page - 1));
        break;
      case TimePeriod.YEARLY:
        startDate = new Date(0); // All time
        endDate = now;
        break;
      default:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7,
        );
        endDate = now;
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
