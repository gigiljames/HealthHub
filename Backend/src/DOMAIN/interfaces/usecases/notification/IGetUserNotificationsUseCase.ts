import { PaginatedNotificationsDTO } from "../../../dtos/notificationDTO";
import { Roles } from "../../../enums/roles";

export interface IGetUserNotificationsUseCase {
  execute(
    userId: string,
    role: Roles,
    page: number,
    limit: number,
  ): Promise<PaginatedNotificationsDTO>;
}
