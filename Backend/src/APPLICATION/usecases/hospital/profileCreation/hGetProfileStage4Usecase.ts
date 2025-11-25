import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHGetProfileStage4Usecase } from "../../../../domain/interfaces/usecases/hospital/IHGetProfileStage4Usecase";
import { HGetProfileStage4DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";
import { HospitalProfileMapper } from "../../../mappers/hospitalProfileMapper";

export class HGetProfileStage4Usecase implements IHGetProfileStage4Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(hospitalId: string): Promise<HGetProfileStage4DTO | null> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      hospitalId
    );
    if (!profile) return null;
    return HospitalProfileMapper.toGetProfileStage4DTOFromEntity(profile);
  }
}
