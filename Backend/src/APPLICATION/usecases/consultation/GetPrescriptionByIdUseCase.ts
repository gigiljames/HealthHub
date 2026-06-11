import { IGetPrescriptionByIdUseCase } from "../../../domain/interfaces/usecases/consultation/IGetPrescriptionByIdUseCase";
import { IPrescriptionRepository } from "../../../domain/interfaces/repositories/IPrescriptionRepository";
import { PrescriptionDTO } from "../../DTOs/consultation/prescriptionDTOs";
import { PrescriptionMapper } from "../../mappers/prescriptionMapper";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";

export class GetPrescriptionByIdUseCase implements IGetPrescriptionByIdUseCase {
  constructor(private readonly _prescriptionRepository: IPrescriptionRepository) {}

  async execute(id: string): Promise<PrescriptionDTO | null> {
    const prescription = await this._prescriptionRepository.findById(id);
    if (!prescription) return null;

    const patientDoc = await authModel.findById(prescription.patientId);
    const doctorDoc = await authModel.findById(prescription.doctorId);
    let specName = "";
    if (doctorDoc) {
      const docProfile = await DoctorProfileModel.findOne({ doctorId: doctorDoc._id });
      if (docProfile?.specialization) {
        const spec = await specializationModel.findById(docProfile.specialization);
        specName = spec?.name ?? "";
      }
    }

    return PrescriptionMapper.toDTO(
      prescription,
      doctorDoc?.name ?? "",
      specName,
      patientDoc?.name ?? "",
    );
  }
}
