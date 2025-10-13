import {
  specializationRequestDTO,
  specializationResponseDTO,
} from "../../../DTOs/admin/specializationDTO";
import Specialization from "../../../../DOMAIN/entities/specialization";
import { ISpecializationRepository } from "../../../../DOMAIN/interfaces/repositories/ISpecializationRepository";
import { IEditSpecializationUsecase } from "../../../../DOMAIN/interfaces/usecases/admin/specializationManagement.ts/IEditSpecializationUsecase";
import { CustomError } from "../../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../../DOMAIN/enums/httpStatusCodes";
import { MESSAGES } from "../../../../DOMAIN/constants/messages";

export class EditSpecializationUsecase implements IEditSpecializationUsecase {
  constructor(private _specializationRepository: ISpecializationRepository) {}

  async execute(
    data: specializationRequestDTO
  ): Promise<specializationResponseDTO> {
    const existingSpec = await this._specializationRepository.findById(data.id);
    if (!existingSpec) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SPEC_DOESNT_EXIST
      );
    }
    const currentSpec = await this._specializationRepository.findByName(
      data.name
    );
    if (currentSpec && currentSpec.id !== data.id) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        MESSAGES.SPEC_ALREADY_EXISTS
      );
    } else {
      const updatedSpec = new Specialization({
        id: data.id,
        name: data.name,
        description: data.description,
        isActive: existingSpec.isActive,
        createdAt: existingSpec.createdAt,
        updatedAt: existingSpec.updatedAt,
      });
      await this._specializationRepository.save(updatedSpec);
      return updatedSpec;
    }
  }
}
