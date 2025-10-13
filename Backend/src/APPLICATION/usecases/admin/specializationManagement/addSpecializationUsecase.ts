import { ISpecializationRepository } from "../../../../DOMAIN/interfaces/repositories/ISpecializationRepository";
import { IAddSpecializationUsecase } from "../../../../DOMAIN/interfaces/usecases/admin/specializationManagement.ts/IAddSpecializationUsecase";
import {
  specializationRequestDTO,
  specializationResponseDTO,
} from "../../../DTOs/admin/specializationDTO";
import Specialization from "../../../../DOMAIN/entities/specialization";
import { CustomError } from "../../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../../DOMAIN/enums/httpStatusCodes";
import { MESSAGES } from "../../../../DOMAIN/constants/messages";

export class AddSpecializationUsecase implements IAddSpecializationUsecase {
  constructor(private _specializationRepository: ISpecializationRepository) {}

  async execute(
    data: specializationRequestDTO
  ): Promise<specializationResponseDTO> {
    const existingSpec = await this._specializationRepository.findByName(
      data.name
    );
    if (existingSpec) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        MESSAGES.SPEC_ALREADY_EXISTS
      );
    }
    const specialization = new Specialization({
      name: data.name,
      description: data.description,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this._specializationRepository.save(specialization);
    return specialization;
  }
}
