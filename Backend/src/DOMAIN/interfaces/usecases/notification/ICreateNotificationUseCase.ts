import { CreateNotificationDTO } from "../../../dtos/notificationDTO";

export interface ICreateNotificationUseCase {
  execute(data: CreateNotificationDTO): Promise<void>;
}
