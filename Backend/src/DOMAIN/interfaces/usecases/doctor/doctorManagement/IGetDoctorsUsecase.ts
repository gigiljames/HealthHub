import {
  GetDoctorsRequestDTO,
  GetDoctorsResponseDTO,
} from "../../../../../application/DTOs/doctor/doctorManagementDTO";

export interface IGetDoctorsUsecase {
  execute(query: GetDoctorsRequestDTO): Promise<GetDoctorsResponseDTO>;
}
