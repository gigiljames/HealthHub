import Notification from "../../../domain/entities/notification";
import { INotificationDocument } from "../../DB/models/notificationModel";

export class NotificationRepoMapper {
  static toDomain(doc: INotificationDocument): Notification {
    return new Notification(
      doc.userId.toString(),
      doc.role,
      doc.title,
      doc.message,
      doc.type,
      doc.isRead,
      doc.referenceId?.toString() || null,
      (doc._id as object).toString(),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  static toEntity(notification: Notification): object {
    return {
      userId: notification.userId,
      role: notification.role,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      referenceId: notification.referenceId,
    };
  }
}
