import { DeclineRescheduleDTO } from "../../../../application/DTOs/appointment/rescheduleDTOs";

export interface IDeclineRescheduleUseCase {
  execute(data: DeclineRescheduleDTO): Promise<void>;
}
