import { IMarkNotificationReadUseCase } from "../../../domain/interfaces/usecases/notification/IMarkNotificationReadUseCase";
import { INotificationRepository } from "../../../domain/interfaces/repositories/INotificationRepository";
import { NotificationResponseDTO } from "../../DTOs/notificationDTO";
import { Roles } from "../../../domain/enums/roles";

export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
  constructor(private readonly _notificationRepository: INotificationRepository) { }

  async execute(notificationId: string): Promise<NotificationResponseDTO | null> {
    const n = await this._notificationRepository.markAsRead(notificationId);
    if (!n) return null;

    return {
      id: n.id as string,
      userId: n.userId,
      role: n.role,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      referenceId: n.referenceId,
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    };
  }

  async markAll(userId: string, role: string): Promise<void> {
    await this._notificationRepository.markAllAsRead(userId, role as Roles);
  }
}
