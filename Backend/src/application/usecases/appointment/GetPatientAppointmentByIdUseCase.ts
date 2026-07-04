import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IGetPatientAppointmentByIdUsecase } from "../../../domain/interfaces/usecases/appointment/IGetPatientAppointmentByIdUsecase";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { PatientAppointmentDetailsDTO } from "../../DTOs/appointment/appointmentDTO";
import { AppointmentMapper } from "../../mappers/appointmentMapper";
import { disputeModel } from "../../../infrastructure/DB/models/disputeModel";
import { consultationReportModel } from "../../../infrastructure/DB/models/consultationReportModel";
import { prescriptionModel } from "../../../infrastructure/DB/models/prescriptionModel";
import { reviewModel } from "../../../infrastructure/DB/models/reviewModel";
import { ReviewRepoMapper } from "../../../infrastructure/repositories/mappers/reviewRepoMapper";
import { ReviewMapper } from "../../mappers/reviewMapper";

export class GetPatientAppointmentByIdUseCase implements IGetPatientAppointmentByIdUsecase {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(
    appointmentId: string,
    patientId: string,
  ): Promise<PatientAppointmentDetailsDTO | null> {
    const appointment =
      await this._appointmentRepository.getPatientAppointmentById(
        appointmentId,
        patientId,
      );
    if (!appointment) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.APPOINTMENT.NOT_FOUND,
      );
    }
    if (appointment.doctor?.profileImageUrl) {
      appointment.doctor.profileImageUrl =
        await this._s3Service.getAccessSignedUrl(
          appointment.doctor.profileImageUrl,
        );
    }
    const dto = AppointmentMapper.toPatientAppointmentDetailsDTO(
      appointment,
      appointment.doctor?.profileImageUrl || null,
    );

    // 1. Fetch Dispute details
    try {
      const dispute = await disputeModel.findOne({
        appointmentId: appointmentId,
        reporterId: patientId,
      }).lean();
      if (dispute) {
        const evidenceWithUrls = [];
        for (const ev of dispute.evidence) {
          let signedUrl = "";
          try {
            signedUrl = await this._s3Service.getAccessSignedUrl(ev.key);
          } catch (err) {
            console.error(`Failed to generate signed access URL for key ${ev.key}`, err);
          }
          evidenceWithUrls.push({
            key: ev.key,
            name: ev.name,
            type: ev.type,
            url: signedUrl,
          });
        }
        dto.dispute = {
          id: dispute._id.toString(),
          appointmentId: dispute.appointmentId.toString(),
          reporterId: dispute.reporterId.toString(),
          reportedUserId: dispute.reportedUserId.toString(),
          reason: dispute.reason,
          description: dispute.description,
          status: dispute.status,
          evidence: evidenceWithUrls,
          createdAt: dispute.createdAt.toISOString(),
          resolutionMessage: dispute.resolutionMessage,
        };
      } else {
        dto.dispute = null;
      }
    } catch (err) {
      console.error("Failed to fetch dispute details for appointment", err);
      dto.dispute = null;
    }

    // 2. Fetch Review details
    try {
      const reviewDoc = await reviewModel.findOne({ appointmentId: appointmentId });
      if (reviewDoc) {
        const reviewEntity = ReviewRepoMapper.toEntityFromDocument(reviewDoc);
        dto.review = ReviewMapper.toDTO(reviewEntity);
      } else {
        dto.review = null;
      }
    } catch (err) {
      console.error("Failed to fetch review details for appointment", err);
      dto.review = null;
    }

    // 3. Fetch Report ID
    try {
      const reportDoc = await consultationReportModel.findOne({ appointmentId: appointmentId }).lean();
      if (reportDoc) {
        dto.consultationReportId = reportDoc._id.toString();
      } else {
        dto.consultationReportId = null;
      }
    } catch (err) {
      console.error("Failed to fetch consultation report ID for appointment", err);
      dto.consultationReportId = null;
    }

    // 4. Fetch Prescription ID
    try {
      const prescriptionDoc = await prescriptionModel.findOne({ appointmentId: appointmentId }).lean();
      if (prescriptionDoc) {
        dto.prescriptionId = prescriptionDoc._id.toString();
      } else {
        dto.prescriptionId = null;
      }
    } catch (err) {
      console.error("Failed to fetch prescription ID for appointment", err);
      dto.prescriptionId = null;
    }

    return dto;
  }
}
