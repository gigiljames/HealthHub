import { ISpecializationRepository } from "../../../domain/interfaces/repositories/ISpecializationRepository";
import { IAddSpecializationUsecase } from "../../../domain/interfaces/usecases/specialization/IAddSpecializationUsecase";
import { specializationRequestDTO } from "../../DTOs/specialization/specializationDTO";
import Specialization from "../../../domain/entities/specialization";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class AddSpecializationUsecase implements IAddSpecializationUsecase {
  constructor(private _specializationRepository: ISpecializationRepository) {}

  async execute(data: specializationRequestDTO): Promise<Specialization> {
    const existingSpec = await this._specializationRepository.findByName(
      data.name,
    );
    if (existingSpec) {
      throw new CustomError(
        HttpStatusCodes.CONFLICT,
        MESSAGES.SPECIALIZATION.ALREADY_EXISTS,
      );
    }
    const specialization = new Specialization({
      name: data.name,
      description: data.description,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this._specializationRepository.save(specialization);
    return saved as Specialization;
  }
}
