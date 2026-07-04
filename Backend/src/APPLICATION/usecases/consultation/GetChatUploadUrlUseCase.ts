import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IConsultationRepository } from "../../../domain/interfaces/repositories/IConsultationRepository";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IMessageRepository } from "../../../domain/interfaces/repositories/IMessageRepository";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { UploadUrlDTO } from "../../DTOs/s3/uploadUrlDTO";

export class GetChatUploadUrlUseCase {
  constructor(
    private readonly _s3Service: IS3Service,
    private readonly _consultationRepository: IConsultationRepository,
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
    private readonly _messageRepository: IMessageRepository
  ) {}

  async execute(
    consultationId: string,
    fileName: string,
    contentType: string,
    fileSize: number,
    senderRole: "doctor" | "patient"
  ): Promise<UploadUrlDTO> {
    if (!consultationId || !fileName || !contentType || fileSize === undefined) {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Missing required file upload details");
    }

    const consultation = await this._consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Consultation not found");
    }

    const appointment = await this._appointmentRepository.findById(consultation.appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found");
    }

    const slot = await this._slotRepository.findById(appointment.slotId);
    if (!slot) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Slot not found");
    }

    if (slot.mode === "in-person") {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "Chat is not available for in-person consultations.");
    }

    if (senderRole === "patient" && consultation.endedAt) {
      const endedTime = new Date(consultation.endedAt).getTime();
      const currentTime = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      if (currentTime - endedTime > sevenDaysMs) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          "Chat is closed. You can only send messages up to 7 days after the consultation."
        );
      }

      const postConsultationMessagesCount = await this._messageRepository.countPatientMessagesAfterDate(
        consultationId,
        new Date(consultation.endedAt)
      );

      if (postConsultationMessagesCount >= 30) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          "Message limit reached. You can only send up to 30 messages after the consultation."
        );
      }
    }

    const EXECUTABLE_EXTENSIONS = [
      "exe", "bat", "cmd", "sh", "bin", "msi", "jar", "com", "apk", "app", 
      "scr", "vbs", "wsf", "run", "ps1", "vbe", "jse"
    ];

    const EXECUTABLE_MIMES = [
      "application/x-msdownload",
      "application/x-sh",
      "application/x-bash",
      "application/x-executable",
      "application/x-elf",
      "application/x-sharedlib",
      "application/x-dosexec",
      "application/java-archive",
      "application/vnd.android.package-archive",
    ];

    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (EXECUTABLE_EXTENSIONS.includes(ext) || EXECUTABLE_MIMES.includes(contentType.toLowerCase())) {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Executable files are strictly not accepted.");
    }

    let type: "image" | "video" | "document" = "document";
    if (
      contentType.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"].includes(ext)
    ) {
      type = "image";
    } else if (
      contentType.startsWith("video/") ||
      ["mp4", "webm", "ogg", "mov", "avi", "mkv", "flv", "wmv"].includes(ext)
    ) {
      type = "video";
    }

    let sizeLimit = 0;
    if (type === "image") {
      sizeLimit = 10 * 1024 * 1024; // 10MB
    } else if (type === "video") {
      sizeLimit = 100 * 1024 * 1024; // 100MB
    } else {
      sizeLimit = 20 * 1024 * 1024; // 20MB
    }

    if (fileSize > sizeLimit) {
      const maxMb = sizeLimit / (1024 * 1024);
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        `File size exceeds the maximum limit of ${maxMb}MB for this file type (${type}).`
      );
    }

    const folder = `consultations/${consultationId}/chat`;
    return await this._s3Service.getUploadSignedUrl(
      fileName,
      contentType,
      folder
    );
  }
}
