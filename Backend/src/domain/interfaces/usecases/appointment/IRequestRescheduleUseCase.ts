import { RequestRescheduleDTO } from "../../../../application/DTOs/appointment/rescheduleDTOs";

export interface IRequestRescheduleUseCase {
  execute(data: RequestRescheduleDTO): Promise<void>;
}
