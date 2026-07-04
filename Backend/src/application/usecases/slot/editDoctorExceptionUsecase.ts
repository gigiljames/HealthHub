import DoctorException from "../../../domain/entities/doctorException";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IDoctorExceptionRepository } from "../../../domain/interfaces/repositories/IDoctorExceptionRepository";
import { IEditDoctorExceptionUsecase } from "../../../domain/interfaces/usecases/slot/IEditDoctorExceptionUsecase";
import {
  createDoctorExceptionRequestDTO,
  doctorExceptionDTO,
} from "../../DTOs/doctorException/doctorExceptionDTO";
import { DoctorExceptionMapper } from "../../mappers/doctorExceptionMapper";

export class EditDoctorExceptionUsecase implements IEditDoctorExceptionUsecase {
  constructor(
    private readonly _doctorExceptionRepository: IDoctorExceptionRepository,
  ) {}

  async execute(
    id: string,
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

    const existing = await this._doctorExceptionRepository.findById(id);
    if (!existing) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.DOCTOR_EXCEPTION.NOT_FOUND,
      );
    }

    if (existing.doctorId !== doctorId) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        MESSAGES.AUTH_MIDDLEWARE_ERROR,
      );
    }

    const exception = new DoctorException({
      id,
      doctorId,
      reason: data.reason,
      startDatetime,
      endDatetime,
    });

    const saved = await this._doctorExceptionRepository.save(exception);
    return DoctorExceptionMapper.toDTOFromEntity(saved);
  }
}
