import mongoose from "mongoose";
import { MESSAGES } from "../../../domain/constants/messages";
import { logger } from "../../../utils/logger";

export class MongoDB {
  public static async connect() {
    try {
      const url = process.env.MONGODB_URL;
      if (url) {
        await mongoose.connect(url);
        logger.info("Connected to MongoDB");
      } else {
        throw new Error(MESSAGES.MONGODB_URL_ERROR);
      }
    } catch (error) {
      logger.error(error);
    }
  }
}
