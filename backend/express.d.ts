import { AccessTokenData } from "./src/domain/types/tokenTypes";

declare global {
  namespace Express {
    export interface Request {
      user?: AccessTokenData;
    }
  }
}
