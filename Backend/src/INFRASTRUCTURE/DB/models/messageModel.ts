import { Document, model, Schema, Types } from "mongoose";

export interface IMessageDocument extends Document {
  _id: Types.ObjectId;
  consultationId: Types.ObjectId;
  roomId: string;
  senderId: Types.ObjectId;
  senderRole: "doctor" | "patient";
  text?: string;
  replyTo: Types.ObjectId | null;
  isEdited: boolean;
  isDeleted: boolean;
  readAt: Date | null;
  file?: {
    key: string;
    name: string;
    type: "image" | "video" | "document";
    size: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessageDocument>(
  {
    consultationId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Consultation",
    },
    roomId: {
      type: String,
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    senderRole: {
      type: String,
      enum: ["doctor", "patient"],
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
    file: {
      key: { type: String },
      name: { type: String },
      type: { type: String, enum: ["image", "video", "document"] },
      size: { type: Number },
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

messageSchema.index({ consultationId: 1, createdAt: 1 });
messageSchema.index({ roomId: 1, createdAt: 1 });

export const messageModel = model<IMessageDocument>("Message", messageSchema);
