import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IDoctorExceptionRepository } from "../../../domain/interfaces/repositories/IDoctorExceptionRepository";
import { IDeleteDoctorExceptionUsecase } from "../../../domain/interfaces/usecases/slot/IDeleteDoctorExceptionUsecase";

export class DeleteDoctorExceptionUsecase implements IDeleteDoctorExceptionUsecase {
  constructor(
    private readonly _doctorExceptionRepository: IDoctorExceptionRepository,
  ) {}

  async execute(id: string): Promise<string> {
    const existing = await this._doctorExceptionRepository.findById(id);
    if (!existing) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.DOCTOR_EXCEPTION.NOT_FOUND,
      );
    }
    await this._doctorExceptionRepository.deleteById(id);
    return id;
  }
}
