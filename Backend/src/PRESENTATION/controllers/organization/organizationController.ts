import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IListOrganizationUsecase } from "../../../domain/interfaces/usecases/organization/IListOrganizationUsecase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class OrganizationController {
  constructor(private _listOrganizationUsecase: IListOrganizationUsecase) {}

  async listOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const organizations = await this._listOrganizationUsecase.execute();
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: MESSAGES.ORGANIZATION.ORGANIZATIONS_FETCHED,
        organizations,
      });
    } catch (error) {
      logger.error("ERROR: Organization controller - getOrganizations");
      next(error);
    }
  }
}
