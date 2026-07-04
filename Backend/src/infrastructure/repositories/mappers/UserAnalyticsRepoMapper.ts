import { UserAppointmentAnalyticsData } from "../../../domain/interfaces/repositories/IUserAnalyticsRepository";

export interface UserAnalyticsAggDoc {
  _id: { toString(): string };
  status: string;
  slot: {
    start: Date | string;
    end: Date | string;
    mode: string;
    practiceLocationId?: string;
  };
  doctorAuth: {
    name: string;
  };
  doctorProfile?: {
    practiceLocations?: Array<{
      _id?: { toString(): string } | string;
      name: string;
    }>;
  };
  specialization?: {
    name: string;
  };
}

export class UserAnalyticsRepoMapper {
  static toAnalyticsDataList(docs: UserAnalyticsAggDoc[]): UserAppointmentAnalyticsData[] {
    return docs.map((doc) => {
      const locationId = doc.slot?.practiceLocationId || null;
      let locationName = "Online";

      if (doc.slot?.mode !== "online" && doc.doctorProfile?.practiceLocations) {
        const matchingLocation = doc.doctorProfile.practiceLocations.find(
          (loc) => loc._id?.toString() === locationId?.toString()
        );
        locationName = matchingLocation ? matchingLocation.name : "Clinic";
      }

      return {
        appointmentId: doc._id?.toString() || "",
        status: doc.status || "",
        slotStart: doc.slot?.start ? new Date(doc.slot.start) : new Date(),
        slotEnd: doc.slot?.end ? new Date(doc.slot.end) : new Date(),
        slotMode: doc.slot?.mode === "online" ? "online" : "in-person",
        practiceLocationId: locationId,
        practiceLocationName: locationName,
        doctorName: doc.doctorAuth?.name || "Doctor",
        specializationName: doc.specialization?.name || "General Medicine",
      };
    });
  }
}
