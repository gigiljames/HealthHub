import { UploadedDocumentRepository } from "../../infrastructure/repositories/uploadedDocumentRepository";
import { S3Service } from "../../application/services/s3Service";
import { CreateUploadedDocumentUseCase } from "../../application/usecases/patient/uploadedDocument/CreateUploadedDocumentUseCase";
import { GetUploadedDocumentsUseCase } from "../../application/usecases/patient/uploadedDocument/GetUploadedDocumentsUseCase";
import { GetUploadedDocumentUseCase } from "../../application/usecases/patient/uploadedDocument/GetUploadedDocumentUseCase";
import { UpdateUploadedDocumentUseCase } from "../../application/usecases/patient/uploadedDocument/UpdateUploadedDocumentUseCase";
import { DeleteUploadedDocumentUseCase } from "../../application/usecases/patient/uploadedDocument/DeleteUploadedDocumentUseCase";
import { UploadedDocumentController } from "../controllers/patient/uploadedDocumentController";

// Repositories
const uploadedDocumentRepository = new UploadedDocumentRepository();

// Services
const s3Service = new S3Service();

// Usecases
const createUploadedDocumentUseCase = new CreateUploadedDocumentUseCase(
  uploadedDocumentRepository,
  s3Service,
);
const getUploadedDocumentsUseCase = new GetUploadedDocumentsUseCase(
  uploadedDocumentRepository,
  s3Service,
);
const getUploadedDocumentUseCase = new GetUploadedDocumentUseCase(
  uploadedDocumentRepository,
  s3Service,
);
const updateUploadedDocumentUseCase = new UpdateUploadedDocumentUseCase(
  uploadedDocumentRepository,
  s3Service,
);
const deleteUploadedDocumentUseCase = new DeleteUploadedDocumentUseCase(
  uploadedDocumentRepository,
  s3Service,
);

// Controllers
export const injectedUploadedDocumentController =
  new UploadedDocumentController(
    createUploadedDocumentUseCase,
    getUploadedDocumentsUseCase,
    getUploadedDocumentUseCase,
    updateUploadedDocumentUseCase,
    deleteUploadedDocumentUseCase,
    s3Service,
  );
