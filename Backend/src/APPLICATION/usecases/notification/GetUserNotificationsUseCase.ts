import { IGetUserNotificationsUseCase } from "../../../domain/interfaces/usecases/notification/IGetUserNotificationsUseCase";
import { INotificationRepository } from "../../../domain/interfaces/repositories/INotificationRepository";
import { PaginatedNotificationsDTO } from "../../DTOs/notificationDTO";
import { Roles } from "../../../domain/enums/roles";

export class GetUserNotificationsUseCase implements IGetUserNotificationsUseCase {
  constructor(private readonly _notificationRepository: INotificationRepository) { }

  async execute(
    userId: string,
    role: Roles,
    page: number,
    limit: number,
  ): Promise<PaginatedNotificationsDTO> {
    const result = await this._notificationRepository.getByUser(userId, role, page, limit);

    const notifications = result.notifications.map((n) => ({
      id: n.id as string,
      userId: n.userId,
      role: n.role,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      referenceId: n.referenceId,
      createdAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : (n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString()),
    }));

    return {
      notifications,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }
}
