import { ConfirmEnrolmentRequestDTO } from "../../../../application/DTOs/organization/organizationDTO";

export interface IConfirmEnrolmentUsecase {
  execute(data: ConfirmEnrolmentRequestDTO): Promise<void>;
}
