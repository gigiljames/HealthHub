import { IDoctorExceptionRepository } from "../../../domain/interfaces/repositories/IDoctorExceptionRepository";
import { IGetDoctorExceptionsUsecase } from "../../../domain/interfaces/usecases/slot/IGetDoctorExceptionsUsecase";
import { doctorExceptionDTO } from "../../DTOs/doctorException/doctorExceptionDTO";
import { DoctorExceptionMapper } from "../../mappers/doctorExceptionMapper";

export class GetDoctorExceptionsUsecase implements IGetDoctorExceptionsUsecase {
  constructor(
    private readonly _doctorExceptionRepository: IDoctorExceptionRepository,
  ) {}

  async execute(doctorId: string): Promise<doctorExceptionDTO[]> {
    const exceptions =
      await this._doctorExceptionRepository.findByDoctorId(doctorId);
    return DoctorExceptionMapper.toDTOListFromEntityList(exceptions);
  }
}
