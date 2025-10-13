import type { Gender } from "../enums/gender.js";
import { MaritalStatus } from "../enums/maritalStatus.js";
import { BloodGroup } from "../enums/bloodGroup.js";

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  bloodGroup: BloodGroup;
  maritalStatus: MaritalStatus;
  dob: Date;
  gender: Gender;
  occupation: string;
  profileImageUrl: string;
  isBlocked: boolean;
  newUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}
