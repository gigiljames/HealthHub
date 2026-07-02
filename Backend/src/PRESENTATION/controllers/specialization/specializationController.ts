import { IActivateSpecializationUsecase } from "../../../domain/interfaces/usecases/specialization/IActivateSpecializationUsecase";
import { IAddSpecializationUsecase } from "../../../domain/interfaces/usecases/specialization/IAddSpecializationUsecase";
import { IDeactivateSpecializationUsecase } from "../../../domain/interfaces/usecases/specialization/IDeactivateSpecializationUsecase";
import { IEditSpecializationUsecase } from "../../../domain/interfaces/usecases/specialization/IEditSpecializationUsecase";
import { IGetSpecializationUsecase } from "../../../domain/interfaces/usecases/specialization/IGetSpecializationsUsecase";
import { GetSpecializationRequestDTO } from "../../../application/DTOs/specialization/specializationDTO";
import {
  addSpecializationSchema,
  editSpecializationSchema,
} from "../../validators/specializationValidator";
import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class SpecializationController {
  constructor(
    private readonly _addSpecializationUsecase: IAddSpecializationUsecase,
    private readonly _activateSpecializaitonUsecase: IActivateSpecializationUsecase,
    private readonly _deactivateSpecializationUsecase: IDeactivateSpecializationUsecase,
    private readonly _editSpecializationUsecase: IEditSpecializationUsecase,
    private readonly _getSpecializationUsecase: IGetSpecializationUsecase,
  ) {}

  async getSpecializations(req: Request, res: Response, next: NextFunction) {
    try {
      const query: GetSpecializationRequestDTO = {
        search: req.query.search ? (req.query.search as string) : "",
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 9,
        sort: req.query.sort ? (req.query.sort as string) : "",
      };
      const specializations =
        await this._getSpecializationUsecase.execute(query);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SPECIALIZATION.SPECIALIZATIONS_FETCHED,
        specializations,
      );
    } catch (error) {
      logger.error("ERROR: Admin controller - getSpecializations");
      next(error);
    }
  }

  async addSpecialization(req: Request, res: Response, next: NextFunction) {
    try {
      const data = addSpecializationSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      const specialization = await this._addSpecializationUsecase.execute(
        data.data,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SPECIALIZATION.CREATED,
        { specialization },
      );
    } catch (error) {
      logger.error("ERROR: Admin controller - addSpecialization");
      next(error);
    }
  }

  async activateSpecialization(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      await this._activateSpecializaitonUsecase.execute({ id });
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SPECIALIZATION.ACTIVATED,
      );
    } catch (error) {
      logger.error("ERROR: Admin Controller - activateSpecialization");
      next(error);
    }
  }

  async deactivateSpecialization(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      await this._deactivateSpecializationUsecase.execute({ id });
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SPECIALIZATION.DEACTIVATED,
      );
    } catch (error) {
      logger.error("ERROR: Admin Controller - deactivateSpecialization");
      next(error);
    }
  }

  async editSpecialization(req: Request, res: Response, next: NextFunction) {
    try {
      const data = editSpecializationSchema.safeParse(req.body);
      if (data.error) {
        logger.error(data.error);
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      const specialization = await this._editSpecializationUsecase.execute(data.data);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SPECIALIZATION.UPDATED,
        { specialization },
      );
    } catch (error) {
      logger.error("ERROR: Admin Controller - editSpecialization");
      next(error);
    }
  }
}

