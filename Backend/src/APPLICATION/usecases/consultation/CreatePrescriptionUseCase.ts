import { ICreatePrescriptionUseCase } from "../../../domain/interfaces/usecases/consultation/ICreatePrescriptionUseCase";
import { IPrescriptionRepository } from "../../../domain/interfaces/repositories/IPrescriptionRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
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
  ) {}

  async execute(input: CreatePrescriptionInputDTO): Promise<PrescriptionDTO> {
    const appointment = await this._appointmentRepository.findById(input.appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found.");
    }

    const existing = await this._prescriptionRepository.findByAppointmentId(input.appointmentId);
    let prescription;
    if (existing) {
      prescription = await this._prescriptionRepository.updateByAppointmentId(input.appointmentId, {
        medicines: input.medicines,
      });
    } else {
      prescription = await this._prescriptionRepository.create({
        appointmentId: input.appointmentId,
        patientId: input.patientId,
        doctorId: input.doctorId,
        medicines: input.medicines,
      });
    }

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
