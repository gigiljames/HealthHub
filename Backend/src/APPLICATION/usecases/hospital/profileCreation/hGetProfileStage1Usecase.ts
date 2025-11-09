import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHGetProfileStage1Usecase } from "../../../../domain/interfaces/usecases/hospital/IHGetProfileStage1Usecase";
import { HGetProfileStage1DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";
import { HospitalProfileMapper } from "../../../mappers/hospitalProfileMapper";

export class HGetProfileStage1Usecase implements IHGetProfileStage1Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(hospitalId: string): Promise<HGetProfileStage1DTO | null> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      hospitalId
    );
    if (!profile) return null;
    return HospitalProfileMapper.toGetProfileStage1DTOFromEntity(profile);
  }
}
