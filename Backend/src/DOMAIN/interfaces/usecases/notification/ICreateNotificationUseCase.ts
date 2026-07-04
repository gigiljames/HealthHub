import { CreateNotificationDTO } from "../../../../application/DTOs/notificationDTO";

export interface ICreateNotificationUseCase {
  execute(data: CreateNotificationDTO): Promise<void>;
}
