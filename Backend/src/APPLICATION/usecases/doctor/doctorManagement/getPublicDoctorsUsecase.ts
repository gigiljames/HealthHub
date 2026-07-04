import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IGetPublicDoctorsUsecase } from "../../../../domain/interfaces/usecases/doctor/doctorManagement/IGetPublicDoctorsUsecase";
import {
  GetDoctorsRequestDTO,
  GetDoctorsResponseDTO,
} from "../../../DTOs/doctor/doctorManagementDTO";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { IGetFullCalendarSlotsUsecase } from "../../../../domain/interfaces/usecases/slot/IGetFullCalendarSlotsUsecase";

export class GetPublicDoctorsUsecase implements IGetPublicDoctorsUsecase {
  constructor(
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _getFullCalendarSlotsUsecase: IGetFullCalendarSlotsUsecase,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(query: GetDoctorsRequestDTO): Promise<GetDoctorsResponseDTO> {
    const response =
      await this._doctorProfileRepository.getPublicDoctors(query);
    for (const doctor of response.doctors) {
      doctor.profileImageUrl = doctor.profileImageUrl
        ? await this._s3Service.getAccessSignedUrl(doctor.profileImageUrl)
        : "";

      try {
        const slots = await this._getFullCalendarSlotsUsecase.execute({
          doctorId: doctor.id,
          startDate: new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          }),
          days: 30,
          future: true,
        });

        let earliestStart: string | null = null;
        for (const locId in slots) {
          for (const dateStr in slots[locId]) {
            for (const slot of slots[locId][dateStr]) {
              const isLocked = slot.lockedUntil && new Date(slot.lockedUntil) > new Date();
              if (!isLocked) {
                if (!earliestStart || new Date(slot.start) < new Date(earliestStart)) {
                  earliestStart = slot.start;
                }
              }
            }
          }
        }
        doctor.nextAvailableDate = earliestStart || "";
      } catch (err) {
        console.error("Failed to calculate next available slot for doctor", doctor.id, err);
        doctor.nextAvailableDate = "";
      }
    }
    return response;
  }
}
