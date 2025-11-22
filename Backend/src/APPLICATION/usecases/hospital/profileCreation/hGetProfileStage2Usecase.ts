import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHGetProfileStage2Usecase } from "../../../../domain/interfaces/usecases/hospital/IHGetProfileStage2Usecase";
import { HGetProfileStage2DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";
import { HospitalProfileMapper } from "../../../mappers/hospitalProfileMapper";

export class HGetProfileStage2Usecase implements IHGetProfileStage2Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(hospitalId: string): Promise<HGetProfileStage2DTO | null> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      hospitalId
    );
    if (!profile) return null;
    return HospitalProfileMapper.toGetProfileStage2DTOFromEntity(profile);
  }
}
