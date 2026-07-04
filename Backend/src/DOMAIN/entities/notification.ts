import { Roles } from "../enums/roles";
import { NotificationType } from "../enums/notificationType";

export interface INotification {
  id?: string;
  userId: string;
  role: Roles;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  referenceId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class Notification implements INotification {
  constructor(
    public userId: string,
    public role: Roles,
    public title: string,
    public message: string,
    public type: NotificationType,
    public isRead: boolean = false,
    public referenceId?: string | null,
    public id?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
