import { S3Service } from "../../application/services/s3Service";
import { GetDpUploadSignedUrlUseCase } from "../../application/usecases/s3/getDpUploadSignedUrlUsecase";
import { GetHospitalRegistrationUploadSignedUrlUseCase } from "../../application/usecases/s3/getHospitalRegistrationUploadSignedUrlUsecase";
import { GetHospitalGstUploadSignedUrlUseCase } from "../../application/usecases/s3/getHospitalGstUploadSignedUrlUsecase";
import { GetDoctorMedicalLicenseUploadSignedUrlUseCase } from "../../application/usecases/s3/getDoctorMedicalLicenseUploadSignedUrlUsecase";
import { GetDoctorDegreeCertificateUploadSignedUrlUseCase } from "../../application/usecases/s3/getDoctorDegreeCertificateUploadSignedUrlUsecase";
import { S3Controller } from "../controllers/common/s3Controller";

// Services
const s3Service = new S3Service();

// Usecases
const getDpUploadSignedUrlUsecase = new GetDpUploadSignedUrlUseCase(s3Service);
const getHospitalRegistrationUploadSignedUrlUsecase =
  new GetHospitalRegistrationUploadSignedUrlUseCase(s3Service);
const getHospitalGstUploadSignedUrlUsecase =
  new GetHospitalGstUploadSignedUrlUseCase(s3Service);
const getDoctorMedicalLicenseUploadSignedUrlUsecase =
  new GetDoctorMedicalLicenseUploadSignedUrlUseCase(s3Service);
const getDoctorDegreeCertificateUploadSignedUrlUsecase =
  new GetDoctorDegreeCertificateUploadSignedUrlUseCase(s3Service);

export const injectedS3Controller = new S3Controller(
  getDpUploadSignedUrlUsecase,
  getHospitalRegistrationUploadSignedUrlUsecase,
  getHospitalGstUploadSignedUrlUsecase,
  getDoctorMedicalLicenseUploadSignedUrlUsecase,
  getDoctorDegreeCertificateUploadSignedUrlUsecase
);
