/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IS3Service } from "../../domain/interfaces/services/IS3Service";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export class S3Service implements IS3Service {
  private _s3Client: S3Client;
  private _bucketName: string;

  constructor() {
    const config: S3Config = {
      region: process.env.AWS_REGION ?? "",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      bucketName: process.env.AWS_S3_BUCKET_NAME ?? "",
    };
    if (
      !config.region ||
      !config.accessKeyId ||
      !config.secretAccessKey ||
      !config.bucketName
    ) {
      throw new Error("Missing AWS environment variables");
    }

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
    folder?: string
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = `${folder}/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this._bucketName,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this._s3Client, command, {
      expiresIn: 60 * 5,
    });

    return { uploadUrl, key };
  }

  async getAccessSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this._bucketName,
      Key: key,
    });
    const signedUrl = await getSignedUrl(this._s3Client, command, {
      expiresIn: 60 * 10,
    });
    return signedUrl;
  }
}
