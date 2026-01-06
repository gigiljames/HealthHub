import { IHospitalProfileRepository } from "../../../../domain/interfaces/repositories/IHospitalProfileRepository";
import { IHGetProfileStage3Usecase } from "../../../../domain/interfaces/usecases/hospital/IHGetProfileStage3Usecase";
import { HGetProfileStage3DTO } from "../../../DTOs/hospital/hospitalProfileCreationDTO";
import { HospitalProfileMapper } from "../../../mappers/hospitalProfileMapper";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";

export class HGetProfileStage3Usecase implements IHGetProfileStage3Usecase {
  constructor(
    private _hospitalProfileRepository: IHospitalProfileRepository,
    private s3Service: IS3Service
  ) {}

  async execute(hospitalId: string): Promise<HGetProfileStage3DTO | null> {
    const profile = await this._hospitalProfileRepository.findByHospitalId(
      hospitalId
    );
    if (!profile) return null;
    let hosRegCert = profile.certificates?.hospitalRegistration;
    let gstCert = profile.certificates?.gstCertificate;
    let hosRegCertUrl: string = "";
    let gstCertUrl: string = "";
    if (hosRegCert) {
      hosRegCertUrl = await this.s3Service.getAccessSignedUrl(hosRegCert);
    }
    if (gstCert) {
      gstCertUrl = await this.s3Service.getAccessSignedUrl(gstCert);
    }
    profile.certificates = {
      hospitalRegistration: hosRegCertUrl,
      gstCertificate: gstCertUrl,
    };
    return HospitalProfileMapper.toGetProfileStage3DTOFromEntity(profile);
  }
}
