import {
  GetDoctorsRequestDTO,
  GetDoctorsResponseDTO,
} from "../../../../../application/DTOs/doctor/doctorManagementDTO";

export interface IGetPublicDoctorsUsecase {
  execute(query: GetDoctorsRequestDTO): Promise<GetDoctorsResponseDTO>;
}
