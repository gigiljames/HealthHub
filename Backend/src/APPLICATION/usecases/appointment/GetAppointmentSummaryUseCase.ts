import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IGetAppointmentSummaryUseCase } from "../../../domain/interfaces/usecases/booking/IGetAppointmentSummaryUseCase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";

export class GetAppointmentSummaryUseCase implements IGetAppointmentSummaryUseCase {
  constructor(
    private readonly _slotRepository: ISlotRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(slotId: string): Promise<any> {
    const slot = await this._slotRepository.findById(slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorIdPopulated(
        slot.doctorId,
      );

    if (!doctorProfile) {
      throw new Error("Doctor profile not found");
    }

    const locationId = slot.practiceLocationId;
    const practiceLocation = doctorProfile.practiceLocations.find(
      (loc: any) => loc._id?.toString() === locationId.toString(),
    );

    if (!practiceLocation) {
      throw new Error("Practice location not found on doctor profile");
    }

    const specialization =
      typeof doctorProfile.specialization === "object"
        ? (doctorProfile.specialization as any)?.name
        : doctorProfile.specialization;

    return {
      doctorName: (doctorProfile.doctorId as any)?.name || "",
      doctorProfilePictureUrl: doctorProfile.profileImageUrl
        ? await this._s3Service.getAccessSignedUrl(
            doctorProfile.profileImageUrl,
          )
        : "",
      specializationName: specialization,
      slotStartTime: slot.start,
      slotEndTime: slot.end,
      slotMode: slot.mode,
      practiceLocationName: practiceLocation.name,
      location: practiceLocation.location,
      consultationFee: practiceLocation.consultationFee,
      availableOnlineModes:
        slot.mode === "online"
          ? practiceLocation.consultationModes.filter((m: string) =>
              ["AUDIO", "VIDEO", "CHAT"].includes(m),
            )
          : [],
      platformFee: 0,
      tax: 0,
      totalAmount: practiceLocation.consultationFee + 0 + 0, // Fee + Platform + Tax
    };
  }
}
