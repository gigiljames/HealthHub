import { NotificationResponseDTO } from "../../../../application/DTOs/notificationDTO";

export interface IMarkNotificationReadUseCase {
  execute(notificationId: string): Promise<NotificationResponseDTO | null>;
  markAll(userId: string, role: string): Promise<void>;
}
