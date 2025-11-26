import {
  GetDoctorsRequestDTO,
  GetDoctorsResponseDTO,
} from "../../../../../application/DTOs/admin/doctorManagementDTO";

export interface IGetDoctorsUsecase {
  execute(query: GetDoctorsRequestDTO): Promise<GetDoctorsResponseDTO>;
}
