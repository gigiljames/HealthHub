import { IMessageRepository } from "../../../domain/interfaces/repositories/IMessageRepository";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class GetChatAccessUrlUseCase {
  constructor(
    private readonly _messageRepository: IMessageRepository,
    private readonly _s3Service: IS3Service
  ) {}

  async execute(messageId: string, download: boolean): Promise<string> {
    const message = await this._messageRepository.findById(messageId);
    if (!message) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Message not found");
    }
    if (!message.file || !message.file.key) {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Message does not contain any file attachment");
    }

    const disposition = download ? "attachment" : "";
    return await this._s3Service.getAccessSignedUrl(message.file.key, disposition);
  }
}
