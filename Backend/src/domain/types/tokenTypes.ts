import { Roles } from "../enums/roles";

export type AccessTokenData = {
  userId: string;
  role: Roles;
};

export type RefreshTokenData = {
  userId: string;
  role: Roles;
};

export type GenerateRefreshTokenReturnType = {
  tokenId: string;
  refreshToken: string;
};
