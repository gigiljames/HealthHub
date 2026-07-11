import { Types } from "mongoose";
import { DoctorProfileModel } from "../../../../infrastructure/DB/models/doctorProfileModel";
import { slotModel, ISlotDocument } from "../../../../infrastructure/DB/models/slotModel";
import { appointmentModel, IAppointmentDocument } from "../../../../infrastructure/DB/models/appointmentModel";
import { transactionModel } from "../../../../infrastructure/DB/models/transactionModel";
import {
  IGetDoctorAnalyticsUsecase,
  GetDoctorAnalyticsResponseDTO,
  LocationAnalyticsDTO,
} from "../../../../domain/interfaces/usecases/doctor/doctorManagement/IGetDoctorAnalyticsUsecase";
import { AppointmentStatus } from "../../../../domain/enums/appointmentStatus";
import { TransactionType } from "../../../../domain/enums/transactionType";
import { PaymentStatus } from "../../../../domain/enums/paymentStatus";

export class GetDoctorAnalyticsUseCase implements IGetDoctorAnalyticsUsecase {
  async execute(doctorId: string): Promise<GetDoctorAnalyticsResponseDTO> {
    const doctorObjectId = new Types.ObjectId(doctorId);

    // 1. Fetch doctor profile to get practice locations list
    const doctorProfile = await DoctorProfileModel.findOne({
      doctorId: doctorObjectId,
    });
    if (!doctorProfile) {
      return { analytics: [] };
    }

    const practiceLocations = doctorProfile.practiceLocations || [];
    const locationAnalyticsList: LocationAnalyticsDTO[] = [];

    const locationsToProcess = [...practiceLocations];

    const activeLocationIds = locationsToProcess.map((l) => String(l._id));
    const dbSlots = (await slotModel.collection.find({ doctorId: doctorObjectId }).toArray()) as unknown as ISlotDocument[];

    const allSlots: ISlotDocument[] = [];
    const allAppointments: IAppointmentDocument[] = [];
    let combinedRevenue = 0;
    let combinedRefunded = 0;

    for (const location of locationsToProcess) {
      const locationId = location._id ? String(location._id) : "";

      // Generate Google Maps URL
      let googleMapsUrl: string | null = null;
      if (location.location) {
        const locData = location.location;
        if (locData.coordinates && locData.coordinates.length === 2) {
          const lng = locData.coordinates[0];
          const lat = locData.coordinates[1];
          googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        } else if (locData.address) {
          googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locData.address)}`;
        }
      }

      // Filter slots for this location in memory (including orphaned fallbacks)
      const slots = dbSlots.filter((slot) => {
        const slotLocId = slot.practiceLocationId ? String(slot.practiceLocationId) : "";
        if (slotLocId === locationId) {
          return true;
        }
        const isOrphaned = !activeLocationIds.includes(slotLocId);
        if (isOrphaned) {
          if (slot.mode === "online") {
            return location.type === "ONLINE" || location.name.toLowerCase().includes("ONLINE");
          } else {
            const firstPhysical = locationsToProcess.find((l) => l.type !== "ONLINE");
            return firstPhysical && String(firstPhysical._id) === locationId;
          }
        }
        return false;
      });
      const slotIds = slots.map((s) => s._id);

      if (slotIds.length === 0) {
        locationAnalyticsList.push({
          locationId,
          locationName: location.name,
          totalConsultations: 0,
          completedConsultations: 0,
          completionRate: 0,
          cancellationRate: 0,
          averageDuration: 0,
          activePatients: 0,
          peakConsultationHour: "N/A",
          peakBookingDay: "N/A",
          averageRating: "N/A",
          revenueGenerated: 0,
          refundedAmount: 0,
          onlineConsultations: 0,
          offlineConsultations: 0,
          averageConsultationsPerDay: 0,
          averageConsultationsPerMonth: 0,
          averageMonthlyRevenue: 0,
          consultationModes: location.consultationModes || [],
          googleMapsUrl,
        });
        continue;
      }

      // Query appointments for these slot IDs
      const appointments = await appointmentModel.find({
        slotId: { $in: slotIds },
      });
      const appointmentIds = appointments.map((a) => a._id);

      const totalConsultations = appointments.length;

      // Completed status
      const completedAppointments = appointments.filter(
        (a) => a.status === AppointmentStatus.COMPLETED
      );
      const completedConsultations = completedAppointments.length;

      // Completion Rate
      const completionRate =
        totalConsultations > 0
          ? parseFloat(((completedConsultations / totalConsultations) * 100).toFixed(1))
          : 0;

      // Cancellation Rate
      const cancelledAppointments = appointments.filter(
        (a) =>
          a.status === AppointmentStatus.CANCELLED ||
          a.status === AppointmentStatus.CANCELLED_BY_USER ||
          a.status === AppointmentStatus.CANCELLED_BY_DOCTOR
      );
      const cancellationRate =
        totalConsultations > 0
          ? parseFloat(((cancelledAppointments.length / totalConsultations) * 100).toFixed(1))
          : 0;

      // Average consultation duration (slot.end - slot.start in minutes)
      let averageDuration = 0;
      if (completedConsultations > 0) {
        let totalDurationMs = 0;
        completedAppointments.forEach((appt) => {
          const slot = slots.find(
            (s) => s._id.toString() === appt.slotId.toString()
          );
          if (slot) {
            totalDurationMs +=
              new Date(slot.end).getTime() - new Date(slot.start).getTime();
          }
        });
        averageDuration = Math.round(
          totalDurationMs / completedConsultations / (1000 * 60)
        );
      }

      // Active patients (unique patientId count)
      const uniquePatients = new Set(
        appointments.map((a) => a.patientId.toString())
      );
      const activePatients = uniquePatients.size;

      // Peak consultation hours
      let peakConsultationHour = "N/A";
      if (totalConsultations > 0) {
        const hourCounts: { [key: number]: number } = {};
        appointments.forEach((appt) => {
          const slot = slots.find(
            (s) => s._id.toString() === appt.slotId.toString()
          );
          if (slot) {
            const hour = new Date(slot.start).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
          }
        });

        let maxHour = -1;
        let maxCount = -1;
        Object.keys(hourCounts).forEach((h) => {
          const hr = parseInt(h);
          if (hourCounts[hr] > maxCount) {
            maxCount = hourCounts[hr];
            maxHour = hr;
          }
        });

        if (maxHour !== -1) {
          const ampm = maxHour >= 12 ? "PM" : "AM";
          const formattedHour = maxHour % 12 || 12;
          peakConsultationHour = `${formattedHour}:00 ${ampm}`;
        }
      }

      // Peak booking days
      let peakBookingDay = "N/A";
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      if (totalConsultations > 0) {
        const dayCounts: { [key: number]: number } = {};
        appointments.forEach((appt) => {
          const slot = slots.find(
            (s) => s._id.toString() === appt.slotId.toString()
          );
          if (slot) {
            const day = new Date(slot.start).getDay();
            dayCounts[day] = (dayCounts[day] || 0) + 1;
          }
        });

        let maxDay = -1;
        let maxCount = -1;
        Object.keys(dayCounts).forEach((d) => {
          const dy = parseInt(d);
          if (dayCounts[dy] > maxCount) {
            maxCount = dayCounts[dy];
            maxDay = dy;
          }
        });

        if (maxDay !== -1) {
          peakBookingDay = daysOfWeek[maxDay];
        }
      }

      // Revenue generated
      let revenueGenerated = 0;
      if (appointmentIds.length > 0) {
        const transactions = await transactionModel.find({
          appointmentId: { $in: appointmentIds },
          status: PaymentStatus.SUCCESS,
        });
        revenueGenerated = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      }

      // Refunded amount
      let refundedAmount = 0;
      if (appointmentIds.length > 0) {
        const refunds = await transactionModel.find({
          appointmentId: { $in: appointmentIds },
          type: TransactionType.APPOINTMENT_REFUND,
          status: PaymentStatus.SUCCESS,
        });
        refundedAmount = refunds.reduce((sum, tx) => sum + tx.amount, 0);
      }

      // Online vs Offline & Active Days/Months
      let onlineConsultations = 0;
      let offlineConsultations = 0;
      const uniqueDays = new Set<string>();
      const uniqueMonths = new Set<string>();

      appointments.forEach((appt) => {
        const slot = slots.find(
          (s) => s._id.toString() === appt.slotId.toString()
        );
        if (slot) {
          if (slot.mode === "online") {
            onlineConsultations++;
          } else {
            offlineConsultations++;
          }
          if (slot.start) {
            const date = new Date(slot.start);
            uniqueDays.add(date.toDateString());
            uniqueMonths.add(`${date.getFullYear()}-${date.getMonth()}`);
          }
        }
      });

      const averageConsultationsPerDay = uniqueDays.size > 0
        ? parseFloat((totalConsultations / uniqueDays.size).toFixed(1))
        : 0;

      const averageConsultationsPerMonth = uniqueMonths.size > 0
        ? parseFloat((totalConsultations / uniqueMonths.size).toFixed(1))
        : 0;

      const averageMonthlyRevenue = uniqueMonths.size > 0
        ? parseFloat((revenueGenerated / uniqueMonths.size).toFixed(2))
        : 0;

      // Add to combined collectors
      allSlots.push(...slots);
      allAppointments.push(...appointments);
      combinedRevenue += revenueGenerated;
      combinedRefunded += refundedAmount;

      locationAnalyticsList.push({
        locationId,
        locationName: location.name,
        totalConsultations,
        completedConsultations,
        completionRate,
        cancellationRate,
        averageDuration,
        activePatients,
        peakConsultationHour,
        peakBookingDay,
        averageRating: "N/A",
        revenueGenerated,
        refundedAmount,
        onlineConsultations,
        offlineConsultations,
        averageConsultationsPerDay,
        averageConsultationsPerMonth,
        averageMonthlyRevenue,
        consultationModes: location.consultationModes || [],
        googleMapsUrl,
      });
    }

    // Process Combined Analytics
    const totalConsultationsCombined = allAppointments.length;
    const completedAppointmentsCombined = allAppointments.filter(
      (a) => a.status === AppointmentStatus.COMPLETED
    );
    const completedConsultationsCombined = completedAppointmentsCombined.length;

    const completionRateCombined = totalConsultationsCombined > 0
      ? parseFloat(((completedConsultationsCombined / totalConsultationsCombined) * 100).toFixed(1))
      : 0;

    const cancelledAppointmentsCombined = allAppointments.filter(
      (a) =>
        a.status === AppointmentStatus.CANCELLED ||
        a.status === AppointmentStatus.CANCELLED_BY_USER ||
        a.status === AppointmentStatus.CANCELLED_BY_DOCTOR
    );
    const cancellationRateCombined = totalConsultationsCombined > 0
      ? parseFloat(((cancelledAppointmentsCombined.length / totalConsultationsCombined) * 100).toFixed(1))
      : 0;

    let averageDurationCombined = 0;
    if (completedConsultationsCombined > 0) {
      let totalDurationMs = 0;
      completedAppointmentsCombined.forEach((appt) => {
        const slot = allSlots.find(
          (s) => s._id.toString() === appt.slotId.toString()
        );
        if (slot) {
          totalDurationMs +=
            new Date(slot.end).getTime() - new Date(slot.start).getTime();
        }
      });
      averageDurationCombined = Math.round(
        totalDurationMs / completedConsultationsCombined / (1000 * 60)
      );
    }

    const uniquePatientsCombined = new Set(
      allAppointments.map((a) => a.patientId.toString())
    );
    const activePatientsCombined = uniquePatientsCombined.size;

    // Peak booking hour for combined
    let peakConsultationHourCombined = "N/A";
    if (totalConsultationsCombined > 0) {
      const hourCounts: { [key: number]: number } = {};
      allAppointments.forEach((appt) => {
        const slot = allSlots.find(
          (s) => s._id.toString() === appt.slotId.toString()
        );
        if (slot) {
          const hour = new Date(slot.start).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });

      let maxHourCombined = -1;
      let maxCountCombined = -1;
      Object.keys(hourCounts).forEach((h) => {
        const hr = parseInt(h);
        if (hourCounts[hr] > maxCountCombined) {
          maxCountCombined = hourCounts[hr];
          maxHourCombined = hr;
        }
      });

      if (maxHourCombined !== -1) {
        const ampmCombined = maxHourCombined >= 12 ? "PM" : "AM";
        const formattedHourCombined = maxHourCombined % 12 || 12;
        peakConsultationHourCombined = `${formattedHourCombined}:00 ${ampmCombined}`;
      }
    }

    // Peak booking day for combined
    let peakBookingDayCombined = "N/A";
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    if (totalConsultationsCombined > 0) {
      const dayCounts: { [key: number]: number } = {};
      allAppointments.forEach((appt) => {
        const slot = allSlots.find(
          (s) => s._id.toString() === appt.slotId.toString()
        );
        if (slot) {
          const day = new Date(slot.start).getDay();
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        }
      });

      let maxDayCombined = -1;
      let maxCountCombined = -1;
      Object.keys(dayCounts).forEach((d) => {
        const dy = parseInt(d);
        if (dayCounts[dy] > maxCountCombined) {
          maxCountCombined = dayCounts[dy];
          maxDayCombined = dy;
        }
      });

      if (maxDayCombined !== -1) {
        peakBookingDayCombined = daysOfWeek[maxDayCombined];
      }
    }

    const uniqueDaysCombined = new Set<string>();
    const uniqueMonthsCombined = new Set<string>();
    let onlineConsultationsCombined = 0;
    let offlineConsultationsCombined = 0;

    allAppointments.forEach((appt) => {
      const slot = allSlots.find(
        (s) => s._id.toString() === appt.slotId.toString()
      );
      if (slot) {
        if (slot.mode === "online") {
          onlineConsultationsCombined++;
        } else {
          offlineConsultationsCombined++;
        }
        if (slot.start) {
          const date = new Date(slot.start);
          uniqueDaysCombined.add(date.toDateString());
          uniqueMonthsCombined.add(`${date.getFullYear()}-${date.getMonth()}`);
        }
      }
    });

    const averageConsultationsPerDayCombined = uniqueDaysCombined.size > 0
      ? parseFloat((totalConsultationsCombined / uniqueDaysCombined.size).toFixed(1))
      : 0;

    const averageConsultationsPerMonthCombined = uniqueMonthsCombined.size > 0
      ? parseFloat((totalConsultationsCombined / uniqueMonthsCombined.size).toFixed(1))
      : 0;

    const averageMonthlyRevenueCombined = uniqueMonthsCombined.size > 0
      ? parseFloat((combinedRevenue / uniqueMonthsCombined.size).toFixed(2))
      : 0;

    const combinedConsultationModes = Array.from(
      new Set(locationsToProcess.flatMap((loc) => loc.consultationModes || []))
    );

    const combinedAnalytics: LocationAnalyticsDTO = {
      locationId: "combined",
      locationName: "All Locations (Combined)",
      totalConsultations: totalConsultationsCombined,
      completedConsultations: completedConsultationsCombined,
      completionRate: completionRateCombined,
      cancellationRate: cancellationRateCombined,
      averageDuration: averageDurationCombined,
      activePatients: activePatientsCombined,
      peakConsultationHour: peakConsultationHourCombined,
      peakBookingDay: peakBookingDayCombined,
      averageRating: "N/A",
      revenueGenerated: combinedRevenue,
      refundedAmount: combinedRefunded,
      onlineConsultations: onlineConsultationsCombined,
      offlineConsultations: offlineConsultationsCombined,
      averageConsultationsPerDay: averageConsultationsPerDayCombined,
      averageConsultationsPerMonth: averageConsultationsPerMonthCombined,
      averageMonthlyRevenue: averageMonthlyRevenueCombined,
      consultationModes: combinedConsultationModes,
      googleMapsUrl: null,
    };

    return {
      analytics: locationAnalyticsList,
      combined: combinedAnalytics,
    };
  }
}
