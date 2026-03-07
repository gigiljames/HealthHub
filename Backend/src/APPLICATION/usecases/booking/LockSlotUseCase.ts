import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { SlotMapper } from "../../mappers/slotMapper";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { env } from "../../../config/envConfig";

export class LockSlotUseCase {
  constructor(private readonly slotRepository: ISlotRepository) {}

  async execute(slotId: string, patientId: string): Promise<slotDTO> {
    const now = new Date();
    const lockExpiry = new Date(now.getTime() + env.SLOT_LOCK_EXPIRY_MS);

    const lockedSlot = await this.slotRepository.lockSlotAtomically(
      slotId,
      patientId,
      lockExpiry,
      now,
    );

    if (!lockedSlot) {
      throw new Error("Slot is no longer available or already locked.");
    }

    return SlotMapper.toSlotDTOFromEntity(lockedSlot);
  }
}
