import { IGetUploadedDocumentUseCase } from "../../../../domain/interfaces/usecases/patient/uploadedDocument/IGetUploadedDocumentUseCase";
import { IUploadedDocumentRepository } from "../../../../domain/interfaces/repositories/IUploadedDocumentRepository";
import { IS3Service } from "../../../../domain/interfaces/services/IS3Service";
import { UploadedDocumentDTO } from "../../../DTOs/patient/uploadedDocumentDTOs";
import { UploadedDocumentMapper } from "../../../mappers/uploadedDocumentMapper";
import { Roles } from "../../../../domain/enums/roles";
import { consultationModel } from "../../../../infrastructure/DB/models/consultationModel";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";

export class GetUploadedDocumentUseCase implements IGetUploadedDocumentUseCase {
  private readonly _uploadedDocumentRepository: IUploadedDocumentRepository;
  private readonly _s3Service: IS3Service;

  constructor(
    uploadedDocumentRepository: IUploadedDocumentRepository,
    s3Service: IS3Service
  ) {
    this._uploadedDocumentRepository = uploadedDocumentRepository;
    this._s3Service = s3Service;
  }

  async execute(
    id: string,
    userId: string,
    role: string
  ): Promise<UploadedDocumentDTO> {
    const document = await this._uploadedDocumentRepository.findById(id);
    if (!document) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Document not found.");
    }

    const patientId = document.patientId;

    if (role === Roles.USER) {
      if (patientId !== userId) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          "You are not authorized to access this document."
        );
      }
    } else if (role === Roles.DOCTOR) {
      // Perform doctor access validation: Must have an active/in-progress consultation with the patient
      const inProgressConsultation = await consultationModel.findOne({
        doctorId: userId,
        patientId: patientId,
        patientJoinedAt: { $ne: null },
        endedAt: null,
      }).lean();

      if (!inProgressConsultation) {
        const existingConsultation = await consultationModel.findOne({
          doctorId: userId,
          patientId: patientId,
          endedAt: null,
        }).lean();

        if (existingConsultation && !existingConsultation.patientJoinedAt) {
          throw new CustomError(
            HttpStatusCodes.FORBIDDEN,
            "Access to patient documents is restricted until the patient has joined the consultation."
          );
        }

        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          "Access to patient documents is only allowed when consultation is in progress."
        );
      }
    } else if (role !== Roles.ADMIN) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "You are not authorized to access this document."
      );
    }

    return UploadedDocumentMapper.toDTO(document, this._s3Service);
  }
}
