import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { PracticeLocationType } from "../../../../domain/enums/practiceLocationType";
import { PracticeType } from "../../../../domain/enums/practiceType";
import { IAuthRepository } from "../../../../domain/interfaces/repositories/IAuthRepository";
import { IDoctorProfileRepository } from "../../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IOrganizationRepository } from "../../../../domain/interfaces/repositories/IOrganizationRepository";
import { IDSetupPractice } from "../../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDSetupPractice";
import { PracticeLocation } from "../../../../domain/types/practiceLocation";
import { doctorSetupPracticeDTO } from "../../../DTOs/doctor/doctorProfileDTO";
import { v4 as uuidv4 } from "uuid";

export class DSetupPractice implements IDSetupPractice {
  constructor(
    private _doctorProfileRepository: IDoctorProfileRepository,
    private _organizationRepository: IOrganizationRepository,
    private _authRepository: IAuthRepository,
  ) {}
  async execute(doctorId: string, data: doctorSetupPracticeDTO): Promise<void> {
    const doctorProfile =
      await this._doctorProfileRepository.findByDoctorId(doctorId);
    if (!doctorProfile) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SAVE_PROFILE_ERROR,
      );
    }
    doctorProfile.practiceType = data.practiceType;
    const practiceLocations: PracticeLocation[] = [];
    if (data.practiceType === PracticeType.ONLINE) {
      const practiceLocation: PracticeLocation = {
        _id: uuidv4(),
        name: "Online",
        type: PracticeLocationType.ONLINE,
        consultationFee: data.consultationFee!,
        consultationModes: data.consultationModes!,
        isPrimary: true,
        isActive: true,
      };
      practiceLocations.push(practiceLocation);
    } else {
      for (let pLoc of data.practiceLocations!) {
        if (pLoc.type === PracticeLocationType.ONLINE) {
          const practiceLocation: PracticeLocation = {
            _id: uuidv4(),
            name: pLoc.name,
            type: PracticeLocationType.ONLINE,
            consultationFee: pLoc.consultationFee!,
            consultationModes: pLoc.consultationModes!,
            isPrimary: true,
            isActive: true,
          };
          practiceLocations.push(practiceLocation);
        } else if (pLoc.type === PracticeLocationType.PRIVATE_CLINIC) {
          const practiceLocation: PracticeLocation = {
            _id: uuidv4(),
            name: pLoc.name,
            type: PracticeLocationType.PRIVATE_CLINIC,
            location: pLoc.location!,
            consultationFee: pLoc.consultationFee!,
            consultationModes: pLoc.consultationModes!,
            isPrimary: true,
            isActive: true,
          };
          practiceLocations.push(practiceLocation);
        } else {
          const organization = await this._organizationRepository.findById(
            pLoc.organizationId!,
          );
          if (!organization) {
            throw new CustomError(
              HttpStatusCodes.NOT_FOUND,
              MESSAGES.ORGANIZATION_NOT_FOUND,
            );
          }
          const practiceLocation: PracticeLocation = {
            _id: uuidv4(),
            organizationId: pLoc.organizationId,
            name: pLoc.name,
            type: pLoc.type,
            location: organization.location,
            consultationFee: pLoc.consultationFee,
            consultationModes: pLoc.consultationModes,
            isPrimary: pLoc.isPrimary,
            isActive: pLoc.isActive,
          };
          practiceLocations.push(practiceLocation);
        }
      }
    }
    doctorProfile.practiceLocations = practiceLocations;
    await this._doctorProfileRepository.save(doctorProfile);
    const auth = await this._authRepository.findById(doctorId);
    if (!auth) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.USER_DOESNT_EXIST,
      );
    }
    if (auth.onboardingStep < 2) {
      auth.onboardingStep = 2;
      await this._authRepository.save(auth);
    }
  }
}
