import {
  GetAllDoctorsRequestDTO,
  GetAllDoctorsResponseDTO,
} from "../../../../../application/DTOs/doctor/doctorManagementDTO";

export interface IGetAllDoctorsUsecase {
  execute(query: GetAllDoctorsRequestDTO): Promise<GetAllDoctorsResponseDTO>;
}
