import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { PracticeType } from "../../../../domain/enums/practiceType";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IDSetupPractice } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDSetupPractice";

export class DSetupPractice implements IDSetupPractice {
  constructor(
    private readonly doctorProfileRepository: IDoctorProfileRepository,
  ) {}
  async execute(doctorId: string, practiceType: PracticeType): Promise<void> {
    if (practiceType === PracticeType.ONLINE) {
      // create new practice with only online and set fee.
    } else {
      // create practices with multiple locations.
    }
    const doctorProfile =
      await this.doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    doctorProfile.practiceType = practiceType;
    await this.doctorProfileRepository.save(doctorProfile);
  }
}
