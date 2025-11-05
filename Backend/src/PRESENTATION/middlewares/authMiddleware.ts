import { NextFunction, Request, Response } from "express";
import { Roles } from "../../domain/enums/roles";
import ITokenService from "../../domain/interfaces/services/ITokenService";
import { logger } from "../../utils/logger";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../domain/constants/messages";

export function authMiddleware(
  allowedRoles: Roles[],
  tokenService: ITokenService
) {
  return function (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const data = tokenService.verifyAccessToken(token);
        req.user = data;
        const role = data.role;
        if (!allowedRoles.includes(role)) {
          return res
            .status(403)
            .json({ success: false, message: MESSAGES.UNAUTHORIZED });
        } else {
          next();
        }
      } catch (error) {
        logger.error("ERROR: Auth Middleware.");
        logger.error(error);
        res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ success: false, message: MESSAGES.UNAUTHORIZED });
      }
    } else {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json({ success: false, message: MESSAGES.UNAUTHORIZED });
    }
  };
}
