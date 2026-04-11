import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IGetSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetSlotsUsecase";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { SlotMapper } from "../../mappers/slotMapper";

export class GetSlotsUsecase implements IGetSlotsUsecase {
  constructor(private readonly _slotRepository: ISlotRepository) {}

  async execute(doctorId: string): Promise<slotDTO[]> {
    const docList = await this._slotRepository.findByDoctorId(doctorId);
    return SlotMapper.toSlotDTOListFromEntityList(docList);
  }
}
