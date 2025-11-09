import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHGetProfileStage5Usecase } from "../../../../domain/interfaces/usecases/hospital/IHGetProfileStage5Usecase";
import { HGetProfileStage5DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";
import { HospitalProfileMapper } from "../../../mappers/hospitalProfileMapper";

export class HGetProfileStage5Usecase implements IHGetProfileStage5Usecase {
  constructor(private _hospitalProfileRepository: IHospitalProfileRepository) {}

  async execute(hospitalId: string): Promise<HGetProfileStage5DTO | null> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      hospitalId
    );
    if (!profile) return null;
    return HospitalProfileMapper.toGetProfileStage5DTOFromEntity(profile);
  }
}
