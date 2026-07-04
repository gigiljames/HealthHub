import { doctorExceptionDTO } from "../../../../application/DTOs/doctorException/doctorExceptionDTO";

export interface IGetDoctorExceptionsUsecase {
  execute(doctorId: string): Promise<doctorExceptionDTO[]>;
}
