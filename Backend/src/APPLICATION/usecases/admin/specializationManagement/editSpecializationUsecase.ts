import { specializationRequestDTO } from "../../../DTOs/admin/specializationDTO";
import Specialization from "../../../../domain/entities/specialization";
import { ISpecializationRepository } from "../../../../domain/interfaces/repositories/ISpecializationRepository";
import { IEditSpecializationUsecase } from "../../../../domain/interfaces/usecases/admin/specializationManagement/IEditSpecializationUsecase";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class EditSpecializationUsecase implements IEditSpecializationUsecase {
  constructor(private _specializationRepository: ISpecializationRepository) {}

  async execute(data: specializationRequestDTO): Promise<void> {
    if (data.id) {
      const existingSpec = await this._specializationRepository.findById(
        data.id
      );
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
      }
    } else {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, MESSAGES.BAD_REQUEST);
    }
  }
}
