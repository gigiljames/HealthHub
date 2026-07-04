import { GetConsultationModesInputDTO, GetConsultationModesOutputDTO } from "../../../../application/DTOs/consultation/consultationModesDTO";


export interface IGetConsultationModesUseCase {
  execute(input: GetConsultationModesInputDTO): Promise<GetConsultationModesOutputDTO>;
}
