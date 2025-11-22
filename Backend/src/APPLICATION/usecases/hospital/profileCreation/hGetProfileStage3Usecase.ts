import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHGetProfileStage3Usecase } from "../../../../domain/interfaces/usecases/hospital/IHGetProfileStage3Usecase";
import { HGetProfileStage3DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";
import { HospitalProfileMapper } from "../../../mappers/hospitalProfileMapper";

export class HGetProfileStage3Usecase implements IHGetProfileStage3Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(hospitalId: string): Promise<HGetProfileStage3DTO | null> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      hospitalId
    );
    if (!profile) return null;
    return HospitalProfileMapper.toGetProfileStage3DTOFromEntity(profile);
  }
}
