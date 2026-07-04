import {
  createDoctorExceptionRequestDTO,
  doctorExceptionDTO,
} from "../../../../application/DTOs/doctorException/doctorExceptionDTO";

export interface ICreateDoctorExceptionUsecase {
  execute(
    data: createDoctorExceptionRequestDTO,
    doctorId: string,
  ): Promise<doctorExceptionDTO>;
}
