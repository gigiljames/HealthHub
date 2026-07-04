import mongoose from "mongoose";
import { MESSAGES } from "../../../domain/constants/messages";
import { logger } from "../../../utils/logger";
import { env } from "../../../config/envConfig";

export class MongoDB {
  public static async connect() {
    try {
      const url = env.MONGODB_URL;
      if (url) {
        await mongoose.connect(url);
        logger.info("Connected to MongoDB");
      } else {
        throw new Error(MESSAGES.ENV.MONGODB_URL_ERROR);
      }
    } catch (error) {
      logger.error(error);
    }
  }
}
