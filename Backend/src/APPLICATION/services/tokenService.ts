import ITokenService from "../../domain/interfaces/services/ITokenService";
import {
  AccessTokenData,
  GenerateRefreshTokenReturnType,
  RefreshTokenData,
} from "../../domain/types/tokenTypes";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/envConfig";
import { CustomError } from "../../domain/entities/customError";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../domain/constants/messages";

export default class TokenService implements ITokenService {
  private readonly _accessTokenSecret: string;
  private readonly _refreshTokenSecret: string;
  constructor() {
    if (!env.ACCESS_TOKEN_SECRET) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.ENV.ACCESS_TOKEN_SECRET_ERROR,
      );
    }
    if (!env.REFRESH_TOKEN_SECRET) {
      throw new CustomError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        MESSAGES.ENV.REFRESH_TOKEN_SECRET_ERROR,
      );
    }
    this._accessTokenSecret = env.ACCESS_TOKEN_SECRET;
    this._refreshTokenSecret = env.REFRESH_TOKEN_SECRET;
  }
  generateAccessToken(data: AccessTokenData): string {
    return jwt.sign(data, this._accessTokenSecret, {
      expiresIn: "5m",
    });
  }

  verifyAccessToken(token: string): AccessTokenData {
    return jwt.verify(token, this._accessTokenSecret) as AccessTokenData;
  }

  generateRefreshToken(data: RefreshTokenData): GenerateRefreshTokenReturnType {
    const tokenId = uuidv4();
    const refreshToken = jwt.sign(data, this._refreshTokenSecret, {
      expiresIn: "1d",
    });
    return { tokenId, refreshToken };
  }

  verifyRefreshToken(token: string): RefreshTokenData {
    return jwt.verify(token, this._refreshTokenSecret) as RefreshTokenData;
  }
}
