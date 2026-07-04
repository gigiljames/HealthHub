import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IGetDoctorSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetDoctorSlotsUsecase";
import {
  getDoctorSlotsGroupedByLocationAndDateDTO,
  groupedSlotsByLocationAndDateDTO,
} from "../../DTOs/slot/slotDTO";

export class GetDoctorSlotsUsecase implements IGetDoctorSlotsUsecase {
  constructor(private readonly _slotRepository: ISlotRepository) {}
  execute(
    params: getDoctorSlotsGroupedByLocationAndDateDTO,
  ): Promise<groupedSlotsByLocationAndDateDTO> {
    return this._slotRepository.getDoctorSlotsGroupedByLocationAndDate(params);
  }
}
