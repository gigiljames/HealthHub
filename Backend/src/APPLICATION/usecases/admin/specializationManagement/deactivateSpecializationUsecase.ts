import { changeSpecializationStatusRequestDTO } from "../../../DTOs/admin/changeSpecializationStatusDTO";
import { ISpecializationRepository } from "../../../../DOMAIN/interfaces/repositories/ISpecializationRepository";
import { IDeactivateSpecializationUsecase } from "../../../../DOMAIN/interfaces/usecases/admin/specializationManagement.ts/IDeactivateSpecializationUsecase";
import { CustomError } from "../../../../DOMAIN/entities/customError";
import { HttpStatusCodes } from "../../../../DOMAIN/enums/httpStatusCodes";
import { MESSAGES } from "../../../../DOMAIN/constants/messages";

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
