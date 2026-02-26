import { ISlotRepository } from "../../domain/interfaces/repositories/ISlotRepository";

export class LockSweeperCron {
  constructor(private readonly slotRepository: ISlotRepository) {}

  async run(): Promise<void> {
    const now = new Date();
    console.log(`[LockSweeperCron] Running at ${now.toISOString()}`);

    try {
      const releasedCount = await this.slotRepository.releaseExpiredLocks(now);
      if (releasedCount > 0) {
        console.log(
          `[LockSweeperCron] Released ${releasedCount} expired slot locks models back to AVAILABLE.`,
        );
      }
    } catch (error) {
      console.error("[LockSweeperCron] Failed to release locks", error);
    }
  }
}
