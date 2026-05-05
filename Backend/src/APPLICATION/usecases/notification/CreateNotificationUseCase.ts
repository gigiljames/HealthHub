import { ICreateNotificationUseCase } from "../../../domain/interfaces/usecases/notification/ICreateNotificationUseCase";
import { INotificationRepository } from "../../../domain/interfaces/repositories/INotificationRepository";
import { ISocketService } from "../../../domain/interfaces/services/ISocketService";
import Notification from "../../../domain/entities/notification";
import { CreateNotificationDTO } from "../../../domain/dtos/notificationDTO";

export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly socketService: ISocketService,
  ) {}

  async execute(data: CreateNotificationDTO): Promise<void> {
    const notification = new Notification(
      data.userId,
      data.role,
      data.title,
      data.message,
      data.type,
      false,
      data.referenceId,
    );

    const savedNotification = await this.notificationRepository.create(notification);

    const notificationDTO = {
      id: savedNotification.id,
      userId: savedNotification.userId,
      role: savedNotification.role,
      title: savedNotification.title,
      message: savedNotification.message,
      type: savedNotification.type,
      isRead: savedNotification.isRead,
      referenceId: savedNotification.referenceId,
      createdAt: savedNotification.createdAt,
    };

    // Emit real-time event to the user's room
    try {
      this.socketService.emitToRoom(data.userId, "new_notification", notificationDTO);
    } catch (err) {
      console.error("Socket emit failed for notification", err);
    }
  }
}
