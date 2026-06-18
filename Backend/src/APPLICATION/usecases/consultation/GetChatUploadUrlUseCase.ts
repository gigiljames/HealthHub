import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { UploadUrlDTO } from "../../DTOs/s3/uploadUrlDTO";

export class GetChatUploadUrlUseCase {
  constructor(private readonly _s3Service: IS3Service) {}

  async execute(
    consultationId: string,
    fileName: string,
    contentType: string,
    fileSize: number
  ): Promise<UploadUrlDTO> {
    if (!consultationId || !fileName || !contentType || fileSize === undefined) {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Missing required file upload details");
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

    // Determine category
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

    // Define size limits in bytes
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
