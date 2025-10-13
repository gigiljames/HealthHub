import ITokenService from "../../DOMAIN/interfaces/services/ITokenService";
import {
  AccessTokenData,
  GenerateRefreshTokenReturnType,
  RefreshTokenData,
} from "../../DOMAIN/types/tokenTypes";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export default class TokenService implements ITokenService {
  private readonly _accessTokenSecret: string;
  private readonly _refreshTokenSecret: string;
  constructor() {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("Access token secret not found");
    }
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error("Refresh token secret not found.");
    }
    this._accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    this._refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  }
  generateAccessToken(data: AccessTokenData): string {
    return jwt.sign(data, this._accessTokenSecret, {
      expiresIn: "10s",
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
