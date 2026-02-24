import { ISpecializationRepository } from "../../../domain/interfaces/repositories/ISpecializationRepository";
import { IActivateSpecializationUsecase } from "../../../domain/interfaces/usecases/specialization/IActivateSpecializationUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { changeSpecializationStatusRequestDTO } from "../../DTOs/specialization/specializationDTO";

export class ActivateSpecializationUsecase
  implements IActivateSpecializationUsecase
{
  constructor(private _specializationRepository: ISpecializationRepository) {}

  async execute(data: changeSpecializationStatusRequestDTO): Promise<void> {
    const existingSpec = await this._specializationRepository.findById(data.id);
    if (!existingSpec) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SPEC_DOESNT_EXIST
      );
    }
    await this._specializationRepository.activate(data.id);
  }
}
