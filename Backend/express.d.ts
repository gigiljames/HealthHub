import { AccessTokenData } from "./src/DOMAIN/types/tokenTypes";

declare global {
  namespace Express {
    export interface Request {
      user?: AccessTokenData;
    }
  }
}
