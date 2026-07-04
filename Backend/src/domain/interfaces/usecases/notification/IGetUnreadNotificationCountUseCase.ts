import { Roles } from "../../../enums/roles";

export interface IGetUnreadNotificationCountUseCase {
  execute(userId: string, role: Roles): Promise<number>;
}
