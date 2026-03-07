import { ISlotRepository } from "../../domain/interfaces/repositories/ISlotRepository";
import { logger } from "../../utils/logger";

export class LockSweeperCron {
  constructor(private readonly slotRepository: ISlotRepository) {}

  async run(): Promise<void> {
    const now = new Date();
    logger.info(`[LockSweeperCron] Running at ${now.toISOString()}`);

    try {
      const releasedCount = await this.slotRepository.releaseExpiredLocks(now);
      if (releasedCount > 0) {
        logger.info(
          `[LockSweeperCron] Released ${releasedCount} expired slot locks models back to AVAILABLE.`,
        );
      }
    } catch (error) {
      logger.error("[LockSweeperCron] Failed to release locks", error);
    }
  }
}
