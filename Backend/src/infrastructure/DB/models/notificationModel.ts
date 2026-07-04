import mongoose, { Document, Schema } from "mongoose";
import { Roles } from "../../../domain/enums/roles";
import { NotificationType } from "../../../domain/enums/notificationType";
import { INotification } from "../../../domain/entities/notification";

export interface INotificationDocument extends INotification, Document {
  id: string;
}

const notificationSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(Roles),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const notificationModel = mongoose.model<INotificationDocument>(
  "Notification",
  notificationSchema,
);
