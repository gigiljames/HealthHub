import {
  createDoctorExceptionRequestDTO,
  doctorExceptionDTO,
} from "../../../../application/DTOs/doctorException/doctorExceptionDTO";

export interface IEditDoctorExceptionUsecase {
  execute(
    id: string,
    data: createDoctorExceptionRequestDTO,
    doctorId: string,
  ): Promise<doctorExceptionDTO>;
}
