import { S3Service } from "../../application/services/s3Service";
import { GetDpUploadSignedUrlUseCase } from "../../application/usecases/s3/getDpUploadSignedUrlUsecase";
import { S3Controller } from "../controllers/common/s3Controller";

// Services
const s3Service = new S3Service();

// Usecases
const getDpUploadSignedUrlUsecase = new GetDpUploadSignedUrlUseCase(s3Service);

export const injectedS3Controller = new S3Controller(
  getDpUploadSignedUrlUsecase
);
