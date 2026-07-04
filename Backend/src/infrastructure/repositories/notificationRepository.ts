import { BaseRepository } from "./base/BaseRepository";
import Notification from "../../domain/entities/notification";
import {
  INotificationRepository,
  PaginatedNotifications,
} from "../../domain/interfaces/repositories/INotificationRepository";
import { notificationModel, INotificationDocument } from "../DB/models/notificationModel";
import { NotificationRepoMapper } from "./mappers/notificationRepoMapper";
import { Roles } from "../../domain/enums/roles";

export class NotificationRepository
  extends BaseRepository<INotificationDocument>
  implements INotificationRepository
{
  constructor() {
    super(notificationModel);
  }

  async create(notification: Notification): Promise<Notification> {
    const data = NotificationRepoMapper.toEntity(notification);
    const createdDoc = await this.model.create(data);
    return NotificationRepoMapper.toDomain(createdDoc as unknown as INotificationDocument);
  }

  async getByUser(
    userId: string,
    role: Roles,
    page: number,
    limit: number,
  ): Promise<PaginatedNotifications> {
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model
        .find({ userId, role })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<INotificationDocument[]>(),
      this.model.countDocuments({ userId, role }),
    ]);

    return {
      notifications: docs.map((doc) =>
        NotificationRepoMapper.toDomain(doc as INotificationDocument),
      ),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getUnreadCount(userId: string, role: Roles): Promise<number> {
    return await this.model.countDocuments({ userId, role, isRead: false });
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    const doc = await this.model.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true, lean: true },
    );
    if (!doc) return null;
    return NotificationRepoMapper.toDomain(doc as unknown as INotificationDocument);
  }

  async markAllAsRead(userId: string, role: Roles): Promise<void> {
    await this.model.updateMany(
      { userId, role, isRead: false },
      { $set: { isRead: true } },
    );
  }
}
