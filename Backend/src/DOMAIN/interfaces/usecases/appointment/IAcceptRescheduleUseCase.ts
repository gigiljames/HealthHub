import { AcceptRescheduleDTO } from "../../../../application/DTOs/appointment/rescheduleDTOs";

export interface IAcceptRescheduleUseCase {
  execute(data: AcceptRescheduleDTO): Promise<void>;
}
