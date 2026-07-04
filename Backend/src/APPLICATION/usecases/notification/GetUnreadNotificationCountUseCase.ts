import { IGetUnreadNotificationCountUseCase } from "../../../domain/interfaces/usecases/notification/IGetUnreadNotificationCountUseCase";
import { INotificationRepository } from "../../../domain/interfaces/repositories/INotificationRepository";
import { Roles } from "../../../domain/enums/roles";

export class GetUnreadNotificationCountUseCase implements IGetUnreadNotificationCountUseCase {
  constructor(private readonly _notificationRepository: INotificationRepository) { }

  async execute(userId: string, role: Roles): Promise<number> {
    return await this._notificationRepository.getUnreadCount(userId, role);
  }
}
