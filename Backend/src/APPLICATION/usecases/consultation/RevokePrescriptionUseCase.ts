import { IPrescriptionRepository } from "../../../domain/interfaces/repositories/IPrescriptionRepository";
import { IRevokePrescriptionUseCase } from "../../../domain/interfaces/usecases/consultation/IRevokePrescriptionUseCase";
import { PrescriptionDTO } from "../../DTOs/consultation/prescriptionDTOs";
import { PrescriptionMapper } from "../../mappers/prescriptionMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";

export class RevokePrescriptionUseCase implements IRevokePrescriptionUseCase {

  constructor(
    private readonly _prescriptionRepository: IPrescriptionRepository,
  ) {}

  async execute(prescriptionId: string, doctorId: string): Promise<PrescriptionDTO> {
    const prescription = await this._prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Prescription not found.");
    }

    if (prescription.doctorId !== doctorId) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "You are not authorized to revoke this prescription."
      );
    }

    const updatedPrescription = await this._prescriptionRepository.updateByAppointmentId(
      prescription.appointmentId,
      { status: "Revoked" }
    );

    const patientDoc = await authModel.findById(updatedPrescription.patientId);
    const doctorDoc = await authModel.findById(updatedPrescription.doctorId);
    let specName = "";
    if (doctorDoc) {
      const docProfile = await DoctorProfileModel.findOne({ doctorId: doctorDoc._id });
      if (docProfile?.specialization) {
        const spec = await specializationModel.findById(docProfile.specialization);
        specName = spec?.name ?? "";
      }
    }

    return PrescriptionMapper.toDTO(
      updatedPrescription,
      doctorDoc?.name ?? "",
      specName,
      patientDoc?.name ?? "",
    );
  }
}
