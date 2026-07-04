import { ICreatePrescriptionUseCase } from "../../../domain/interfaces/usecases/consultation/ICreatePrescriptionUseCase";
import { IPrescriptionRepository } from "../../../domain/interfaces/repositories/IPrescriptionRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import {
  CreatePrescriptionInputDTO,
  PrescriptionDTO,
} from "../../DTOs/consultation/prescriptionDTOs";
import { PrescriptionMapper } from "../../mappers/prescriptionMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";

export class CreatePrescriptionUseCase implements ICreatePrescriptionUseCase {
  constructor(
    private readonly _prescriptionRepository: IPrescriptionRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
  ) {}

  async execute(input: CreatePrescriptionInputDTO): Promise<PrescriptionDTO> {
    const appointment = await this._appointmentRepository.findById(input.appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found.");
    }

    const docProfile = await this._doctorProfileRepository.findByDoctorId(input.doctorId);
    if (!docProfile || !docProfile.signatureKey) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Please draw/upload your digital signature in profile settings before signing and issuing prescriptions."
      );
    }

    const existing = await this._prescriptionRepository.findByAppointmentId(input.appointmentId);
    let prescription;
    if (existing) {
      prescription = await this._prescriptionRepository.updateByAppointmentId(input.appointmentId, {
        medicines: input.medicines,
        signatureKey: docProfile.signatureKey,
      });
    } else {
      prescription = await this._prescriptionRepository.create({
        appointmentId: input.appointmentId,
        patientId: input.patientId,
        doctorId: input.doctorId,
        medicines: input.medicines,
        signatureKey: docProfile.signatureKey,
      });
    }

    const patientDoc = await authModel.findById(prescription.patientId);
    const doctorDoc = await authModel.findById(prescription.doctorId);
    let specName = "";
    if (doctorDoc) {
      const docProfileRecord = await DoctorProfileModel.findOne({ doctorId: doctorDoc._id });
      if (docProfileRecord?.specialization) {
        const spec = await specializationModel.findById(docProfileRecord.specialization);
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

