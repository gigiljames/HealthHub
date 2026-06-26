import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IS3Service } from "../../domain/interfaces/services/IS3Service";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../../config/envConfig";

interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export class S3Service implements IS3Service {
  private readonly _s3Client: S3Client;
  private readonly _bucketName: string;

  constructor() {
    const config: S3Config = {
      region: env.AWS_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      bucketName: env.AWS_S3_BUCKET_NAME,
    };

    this._s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this._bucketName = config.bucketName;
  }

  async getUploadSignedUrl(
    fileName: string,
    contentType: string,
    folder?: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = `${folder}/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this._bucketName,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this._s3Client, command, {
      expiresIn: env.AWS_SIGNED_UPLOAD_URL_EXPIRY,
    });

    return { uploadUrl, key };
  }

  async getAccessSignedUrl(key: string, contentDisposition: string = "attachment"): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this._bucketName,
      Key: key,
      ...(contentDisposition ? { ResponseContentDisposition: contentDisposition } : {}),
    });
    const signedUrl = await getSignedUrl(this._s3Client, command, {
      expiresIn: env.AWS_SIGNED_ACCESS_URL_EXPIRY,
    });
    return signedUrl;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this._bucketName,
      Key: key,
    });
    await this._s3Client.send(command);
  }
}
