import { ISpecializationRepository } from "../../../../domain/interfaces/repositories/ISpecializationRepository";
import { IAddSpecializationUsecase } from "../../../../domain/interfaces/usecases/admin/specializationManagement/IAddSpecializationUsecase";
import { specializationRequestDTO } from "../../../DTOs/admin/specializationDTO";
import Specialization from "../../../../domain/entities/specialization";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../../domain/constants/messages";

export class AddSpecializationUsecase implements IAddSpecializationUsecase {
  constructor(private _specializationRepository: ISpecializationRepository) {}

  async execute(data: specializationRequestDTO): Promise<void> {
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
  }
}
