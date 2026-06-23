import { IGetDisputeDetailsUseCase } from "../../../domain/interfaces/usecases/disputes/IGetDisputeDetailsUseCase";
import { IDisputeRepository } from "../../../domain/interfaces/repositories/IDisputeRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IConsultationRepository } from "../../../domain/interfaces/repositories/IConsultationRepository";
import { IMessageRepository } from "../../../domain/interfaces/repositories/IMessageRepository";
import { IConsultationReportRepository } from "../../../domain/interfaces/repositories/IConsultationReportRepository";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { DisputeDetailsDTO } from "../../DTOs/dispute/disputeDTOs";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { slotModel } from "../../../infrastructure/DB/models/slotModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { transactionModel } from "../../../infrastructure/DB/models/transactionModel";
import dayjs from "dayjs";

export class GetDisputeDetailsUseCase implements IGetDisputeDetailsUseCase {
  constructor(
    private readonly _disputeRepository: IDisputeRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _consultationRepository: IConsultationRepository,
    private readonly _messageRepository: IMessageRepository,
    private readonly _consultationReportRepository: IConsultationReportRepository,
    private readonly _s3Service: IS3Service,
  ) {}

  async execute(disputeId: string): Promise<DisputeDetailsDTO> {
    const dispute = await this._disputeRepository.findById(disputeId);
    if (!dispute) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Dispute report not found");
    }

    // Fetch reporter and reported user details from Auth
    const reporterAuth = await authModel.findById(dispute.reporterId);
    const reportedAuth = await authModel.findById(dispute.reportedUserId);

    if (!reporterAuth || !reportedAuth) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Associated user accounts not found");
    }

    // Determine current account status description
    let currentAccountStatus = "Active";
    if (reportedAuth.isBlocked) {
      if (reportedAuth.suspensionStatus === "banned") {
        currentAccountStatus = "Permanently Banned";
      } else if (reportedAuth.suspensionStatus === "suspended") {
        const endDateStr = reportedAuth.suspensionEnd
          ? dayjs(reportedAuth.suspensionEnd).format("MMM DD, YYYY")
          : "N/A";
        currentAccountStatus = `Suspended (until ${endDateStr})`;
      } else {
        currentAccountStatus = "Suspended/Blocked";
      }
    } else if (reportedAuth.isBookingBlocked) {
      currentAccountStatus = "New Bookings Blocked";
    }

    // Fetch appointment and slot details
    const appointment = await this._appointmentRepository.findById(dispute.appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment record not found");
    }

    const slot = await slotModel.findById(appointment.slotId);
    if (!slot) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment slot details not found");
    }

    // Fetch doctor profile to find practice location details
    const doctorProfile = await DoctorProfileModel.findOne({ doctorId: appointment.doctorId });
    let practiceLocation = null;
    if (doctorProfile && doctorProfile.practiceLocations && slot.practiceLocationId) {
      const locIdStr = slot.practiceLocationId.toString();
      practiceLocation = doctorProfile.practiceLocations.find(
        (loc: any) => loc._id && loc._id.toString() === locIdStr
      );
    }

    // Fetch refund transaction details if available
    let refundDetails = null;
    if (appointment.refundTransactionId) {
      const refundTx = await transactionModel.findById(appointment.refundTransactionId);
      if (refundTx) {
        refundDetails = {
          transactionId: refundTx._id.toString(),
          amount: refundTx.amount,
          status: refundTx.status,
          createdAt: refundTx.createdAt.toISOString(),
        };
      }
    }

    // Fetch consultation report if available
    const consultationReport = await this._consultationReportRepository.findByAppointmentId(
      dispute.appointmentId,
    );
    const medicalReports = [];
    if (consultationReport) {
      medicalReports.push({
        id: consultationReport.id!,
        chiefComplaint: consultationReport.chiefComplaint,
        diagnosis: consultationReport.diagnosis,
        clinicalNotes: consultationReport.clinicalNotes,
        createdAt: consultationReport.createdAt ? consultationReport.createdAt.toISOString() : new Date().toISOString(),
      });
    }

    // Fetch consultation and complete chat history
    const consultation = await this._consultationRepository.findByAppointmentId(
      dispute.appointmentId,
    );

    const chatHistory = [];
    if (consultation && consultation.id) {
      const messages = await this._messageRepository.findByConsultationId(consultation.id);
      for (const msg of messages) {
        // Map sender name & role dynamically from user details
        let senderName = "Unknown";
        let senderRole = msg.senderRole;
        if (msg.senderId.toString() === reporterAuth._id.toString()) {
          senderName = reporterAuth.name;
          senderRole = reporterAuth.role;
        } else if (msg.senderId.toString() === reportedAuth._id.toString()) {
          senderName = reportedAuth.name;
          senderRole = reportedAuth.role;
        }

        let fileObj = undefined;
        if (msg.file && msg.file.key) {
          fileObj = {
            key: msg.file.key,
            name: msg.file.name,
            type: msg.file.type,
            size: msg.file.size,
          };
        }

        chatHistory.push({
          id: msg._id ? msg._id.toString() : msg.id ? msg.id.toString() : undefined,
          senderId: msg.senderId.toString(),
          senderRole,
          senderName,
          timestamp: msg.createdAt.toISOString(),
          text: msg.text || null,
          isDeleted: msg.isDeleted || false,
          file: fileObj,
        });
      }
    }

    // Map dispute evidence (without S3 pre-signed URLs on initial load)
    const mappedEvidence = dispute.evidence.map(ev => ({
      key: ev.key,
      name: ev.name,
      type: ev.type,
    }));

    return {
      dispute: {
        id: dispute.id!,
        appointmentId: dispute.appointmentId,
        reporterId: dispute.reporterId,
        reportedUserId: dispute.reportedUserId,
        reason: dispute.reason,
        description: dispute.description,
        evidence: mappedEvidence,
        status: dispute.status,
        resolutionMessage: dispute.resolutionMessage,
        resolvedBy: dispute.resolvedBy,
        resolvedAt: dispute.resolvedAt ? dispute.resolvedAt.toISOString() : null,
        createdAt: dispute.createdAt.toISOString(),
        updatedAt: dispute.updatedAt.toISOString(),
      },
      reporter: {
        id: reporterAuth._id.toString(),
        name: reporterAuth.name,
        email: reporterAuth.email,
        role: reporterAuth.role,
      },
      reportedUser: {
        id: reportedAuth._id.toString(),
        name: reportedAuth.name,
        email: reportedAuth.email,
        role: reportedAuth.role,
        currentAccountStatus,
      },
      appointment: {
        id: appointment.id!,
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        consultationMode: slot.mode,
        status: appointment.status,
        practiceLocation: practiceLocation ? {
          name: practiceLocation.name,
          address: practiceLocation.location?.address || "",
        } : null,
        isRefunded: !!appointment.refundTransactionId,
        refundDetails,
        cancellationReason: appointment.cancellationReason || null,
      },
      medicalReports,
      chatHistory,
    };
  }
}
