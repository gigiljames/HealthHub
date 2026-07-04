import { ResubmitEnrolmentRequestDTO } from "../../../../application/DTOs/organization/organizationDTO";

export interface IResubmitEnrolmentUsecase {
  execute(data: ResubmitEnrolmentRequestDTO): Promise<void>;
}
