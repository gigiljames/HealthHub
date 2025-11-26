import {
  GetHospitalsRequestDTO,
  GetHospitalsResponseDTO,
} from "../../../../../application/DTOs/admin/hospitalManagementDTO";

export interface IGetHospitalsUsecase {
  execute(query: GetHospitalsRequestDTO): Promise<GetHospitalsResponseDTO>;
}
