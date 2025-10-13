import { Document, model, Schema } from "mongoose";
import { Roles } from "../../../DOMAIN/enums/roles";

export interface IAuthDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  googleId: string;
  role: Roles;
  isBlocked: boolean;
  isNewUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const authSchema = new Schema<IAuthDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(Roles),
      required: true,
    },
    isBlocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    isNewUser: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const authModel = model<IAuthDocument>("Auth", authSchema);
