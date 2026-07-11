import Auth from "../../domain/entities/auth";
import { PopulatedPracticeLocation } from "../../domain/types/populatedPracticeLocation";
import { AppointmentSummaryDTO } from "../DTOs/booking/bookingDTO";

export interface SlotData {
  start: Date;
  end: Date;
  mode: string;
  practiceLocationId: string;
  doctorId: string;
}

export interface DoctorProfileData {
  doctorId: Auth;
  profileImageUrl?: string;
  specialization?: string;
  practiceLocations: PopulatedPracticeLocation[];
}

export interface LocationData {
  _id?: string;
  name: string;
  location?: { address: string };
  consultationFee: number;
  consultationModes: string[];
}

export class BookingMapper {
  static toAppointmentSummaryDTO(
    slot: SlotData,
    doctorProfile: DoctorProfileData,
    practiceLocation: LocationData,
    profileImageUrl: string,
    specializationName: string,
    platformFee: number,
  ): AppointmentSummaryDTO {
    return {
      doctorName: doctorProfile.doctorId?.name || "",
      doctorProfilePictureUrl: profileImageUrl,
      specializationName: specializationName,
      slotStartTime: slot.start,
      slotEndTime: slot.end,
      slotMode: slot.mode,
      practiceLocationName: practiceLocation.name,
      location: practiceLocation.location?.address || "",
      consultationFee: practiceLocation.consultationFee,
      availableOnlineModes:
        slot.mode === "online"
          ? practiceLocation.consultationModes.filter((m: string) =>
            ["AUDIO", "VIDEO", "CHAT"].includes(m),
          )
          : [],
      platformFee,
      tax: 0,
      totalAmount: practiceLocation.consultationFee + platformFee,
    };
  }
}
