import {
  AccessTokenData,
  GenerateRefreshTokenReturnType,
  RefreshTokenData,
} from "../../types/tokenTypes";

export default interface ITokenService {
  generateAccessToken(data: AccessTokenData): string;
  verifyAccessToken(token: string): AccessTokenData;
  generateRefreshToken(data: RefreshTokenData): GenerateRefreshTokenReturnType;
  verifyRefreshToken(token: string): RefreshTokenData;
}
