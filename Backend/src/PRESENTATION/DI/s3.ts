import { S3Service } from "../../application/services/s3Service";
import { DGetMedicalLicenseUploadSignedUrlUseCase } from "../../application/usecases/doctor/doctorProfile/dGetMedicalLicenseUploadSignedUrlUsecase";
import { DGetDegreeCertificateUploadSignedUrlUseCase } from "../../application/usecases/doctor/doctorProfile/dGetDegreeCertificateUploadSignedUrlUsecase";
import { S3Controller } from "../controllers/common/s3Controller";

// Services
const s3Service = new S3Service();

// Usecases
const dGetMedicalLicenseUploadSignedUrlUsecase =
  new DGetMedicalLicenseUploadSignedUrlUseCase(s3Service);
const dGetDegreeCertificateUploadSignedUrlUsecase =
  new DGetDegreeCertificateUploadSignedUrlUseCase(s3Service);

export const injectedS3Controller = new S3Controller(
  dGetMedicalLicenseUploadSignedUrlUsecase,
  dGetDegreeCertificateUploadSignedUrlUsecase,
);
