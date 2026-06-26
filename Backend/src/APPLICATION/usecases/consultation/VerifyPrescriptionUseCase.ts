import { IPrescriptionRepository } from "../../../domain/interfaces/repositories/IPrescriptionRepository";
import { IDoctorProfileRepository } from "../../../domain/interfaces/repositories/IDoctorProfileRepository";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IVerifyPrescriptionUseCase } from "../../../domain/interfaces/usecases/consultation/IVerifyPrescriptionUseCase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";
import { userProfileModel } from "../../../infrastructure/DB/models/userProfileModel";
import dayjs from "dayjs";

export interface VerifiedPrescriptionDTO {
  prescriptionNumber: string;
  issueDate: string;
  status: "Valid" | "Revoked" | "Expired";
  doctor: {
    name: string;
    qualifications: string;
    medicalRegistrationNumber: string;
    phone: string;
    signatureUrl?: string;
  };
  patient: {
    name: string;
    age?: number;
    gender: string;
  };
  medicines: Array<{
    medicine: string;
    dosage: string;
    frequency: string;
    timing: "Before Food" | "After Food";
    duration: string;
  }>;
}

export class VerifyPrescriptionUseCase implements IVerifyPrescriptionUseCase {

  constructor(
    private readonly _prescriptionRepository: IPrescriptionRepository,
    private readonly _doctorProfileRepository: IDoctorProfileRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(token: string): Promise<VerifiedPrescriptionDTO> {
    const prescription = await this._prescriptionRepository.findByVerificationToken(token);
    if (!prescription) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Prescription not found.");
    }

    // 1. Determine Status (Expired after 30 days)
    let status: "Valid" | "Revoked" | "Expired" = "Valid";
    if (prescription.status === "Revoked") {
      status = "Revoked";
    } else {
      const createdAt = prescription.createdAt ? dayjs(prescription.createdAt) : dayjs();
      if (dayjs().diff(createdAt, "day") > 30) {
        status = "Expired";
      }
    }

    // 2. Fetch Doctor details
    const doctorAuth = await authModel.findById(prescription.doctorId);
    const doctorProfile = await this._doctorProfileRepository.findByDoctorId(prescription.doctorId);
    
    let qualifications = "Medical Professional";
    let registrationNumber = "";
    let phone = "";
    let signatureUrl = "";

    if (doctorProfile) {
      if (doctorProfile.education && doctorProfile.education.length > 0) {
        qualifications = doctorProfile.education.map((edu) => edu.title).join(", ");
      }
      registrationNumber = doctorProfile.medicalRegistrationNumber || "N/A";
      phone = doctorProfile.phone || "";
      
      // Use prescription signatureKey, fallback to doctor's profile signatureKey
      const sigKey = prescription.signatureKey || doctorProfile.signatureKey;
      if (sigKey) {
        try {
          signatureUrl = await this._s3Service.getAccessSignedUrl(sigKey, "inline");
        } catch (err) {
          console.error("Failed to generate signature signed URL:", err);
        }
      }
    }

    // 3. Fetch Patient details
    const patientAuth = await authModel.findById(prescription.patientId);
    const patientProfile = await userProfileModel.findOne({ userId: prescription.patientId });

    let patientAge: number | undefined;
    let patientGender = "none";

    if (patientProfile) {
      patientGender = patientProfile.gender || "none";
      if (patientProfile.dob) {
        patientAge = dayjs().diff(dayjs(patientProfile.dob), "year");
      }
    }

    return {
      prescriptionNumber: prescription.prescriptionNumber || `RX-${prescription.id?.slice(-6).toUpperCase()}`,
      issueDate: prescription.createdAt ? prescription.createdAt.toISOString() : new Date().toISOString(),
      status,
      doctor: {
        name: doctorAuth?.name || "Unknown Doctor",
        qualifications,
        medicalRegistrationNumber: registrationNumber,
        phone,
        signatureUrl,
      },
      patient: {
        name: patientAuth?.name || "Unknown Patient",
        age: patientAge,
        gender: patientGender,
      },
      medicines: prescription.medicines.map((med) => ({
        medicine: med.medicine,
        dosage: med.dosage,
        frequency: med.frequency,
        timing: med.timing,
        duration: med.duration,
      })),
    };
  }
}
