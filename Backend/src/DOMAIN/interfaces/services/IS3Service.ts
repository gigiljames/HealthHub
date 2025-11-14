export interface IS3Service {
  getUploadSignedUrl(
    fileName: string,
    contentType: string,
    folder?: string
  ): Promise<{ uploadUrl: string; key: string }>;

  getAccessSignedUrl(key: string): Promise<string>;
}
