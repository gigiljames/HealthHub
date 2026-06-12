import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IGetAppointmentSummaryUseCase } from "../../../domain/interfaces/usecases/booking/IGetAppointmentSummaryUseCase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { MESSAGES } from "../../../domain/constants/messages";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { CustomError } from "../../../domain/entities/customError";
import { AppointmentSummaryDTO } from "../../DTOs/booking/bookingDTO";
import { BookingMapper } from "../../mappers/bookingMapper";
import { PopulatedPracticeLocation } from "../../../domain/types/populatedPracticeLocation";
import Specialization from "../../../domain/entities/specialization";
import Slot from "../../../domain/entities/slot";
import { SlotStatus } from "../../../domain/enums/slotStatus";

export class GetAppointmentSummaryUseCase
  implements IGetAppointmentSummaryUseCase
{
  constructor(
    private readonly _slotRepository: ISlotRepository,
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(slotId: string): Promise<AppointmentSummaryDTO> {
    let slot: Slot | null = null;
    if (slotId.startsWith("vslot_")) {
      const parts = slotId.split("_");
      const ruleId = parts[1];
      const startTimeMillis = parseInt(parts[2], 10);
      const startTime = new Date(startTimeMillis);

      const rule = await this._scheduleRuleRepository.findById(ruleId);
      if (!rule || !rule.id) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.SCHEDULE_RULE.NOT_FOUND,
        );
      }
      const endTime = new Date(startTime.getTime() + rule.duration * 60000);

      slot = new Slot({
        doctorId: rule.doctorId,
        title: rule.title,
        start: startTime,
        end: endTime,
        mode: rule.mode,
        practiceLocationId: rule.practiceLocationId,
        status: SlotStatus.AVAILABLE,
        scheduleRuleId: rule.id,
      });
    } else {
      slot = await this._slotRepository.findById(slotId);
    }

    if (!slot) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.SLOT.NOT_FOUND,
      );
    }

    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorIdPopulated(
        slot.doctorId,
      );

    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.DOCTOR.PROFILE_NOT_FOUND,
      );
    }

    const locationId = slot.practiceLocationId;
    const practiceLocation = doctorProfile.practiceLocations.find(
      (loc: PopulatedPracticeLocation) =>
        loc._id?.toString() === locationId.toString(),
    );

    if (!practiceLocation) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.DOCTOR.PRACTICE_LOCATION_NOT_FOUND,
      );
    }

    const specialization =
      typeof doctorProfile.specialization === "object"
        ? (doctorProfile.specialization as Specialization)?.name
        : doctorProfile.specialization;

    return BookingMapper.toAppointmentSummaryDTO(
      slot,
      {
        doctorId: doctorProfile.doctorId as any,
        profileImageUrl: doctorProfile.profileImageUrl,
        specialization: doctorProfile.specialization?.name,
        practiceLocations: doctorProfile.practiceLocations,
      },
      practiceLocation,
      doctorProfile.profileImageUrl
        ? await this._s3Service.getAccessSignedUrl(
            doctorProfile.profileImageUrl,
          )
        : "",
      specialization!,
    );
  }
}
