import type { ObjectId } from "mongoose";
import type { Gender } from "../enums/gender.js";

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  bloodGroup: string;
  maritalStatus: string;
  dob: Date;
  gender: Gender;
  occupation: string;
  profileImageUrl: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
