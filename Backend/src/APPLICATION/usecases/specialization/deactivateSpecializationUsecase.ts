import { changeSpecializationStatusRequestDTO } from "../../DTOs/specialization/specializationDTO";
import { ISpecializationRepository } from "../../../domain/interfaces/repositories/ISpecializationRepository";
import { IDeactivateSpecializationUsecase } from "../../../domain/interfaces/usecases/specialization/IDeactivateSpecializationUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class DeactivateSpecializationUsecase
  implements IDeactivateSpecializationUsecase
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
    await this._specializationRepository.deactivate(data.id);
  }
}
