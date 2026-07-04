import DoctorException from "../../../domain/entities/doctorException";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IDoctorExceptionRepository } from "../../../domain/interfaces/repositories/IDoctorExceptionRepository";
import { ICreateDoctorExceptionUsecase } from "../../../domain/interfaces/usecases/slot/ICreateDoctorExceptionUsecase";
import {
  createDoctorExceptionRequestDTO,
  doctorExceptionDTO,
} from "../../DTOs/doctorException/doctorExceptionDTO";
import { DoctorExceptionMapper } from "../../mappers/doctorExceptionMapper";

export class CreateDoctorExceptionUsecase
  implements ICreateDoctorExceptionUsecase
{
  constructor(
    private readonly _doctorExceptionRepository: IDoctorExceptionRepository,
  ) {}

  async execute(
    data: createDoctorExceptionRequestDTO,
    doctorId: string,
  ): Promise<doctorExceptionDTO> {
    const startDatetime = new Date(data.startDatetime);
    const endDatetime = new Date(data.endDatetime);

    if (endDatetime <= startDatetime) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.DOCTOR_EXCEPTION.END_MUST_BE_AFTER_START,
      );
    }

    const exception = new DoctorException({
      doctorId,
      reason: data.reason,
      startDatetime,
      endDatetime,
    });

    const saved = await this._doctorExceptionRepository.save(exception);
    return DoctorExceptionMapper.toDTOFromEntity(saved);
  }
}
