import { AccessTokenData } from "../domain/types/tokenTypes";

declare module "express-serve-static-core" {
  interface Request {
    user?: AccessTokenData;
  }
}
