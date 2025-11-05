import { NextFunction, Request, Response } from "express";
import { IActivateSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement.ts/IActivateSpecializationUsecase";
import { IAddSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement.ts/IAddSpecializationUsecase";
import { IDeactivateSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement.ts/IDeactivateSpecializationUsecase";
import { IEditSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement.ts/IEditSpecializationUsecase";
import { specializationResponseDTO } from "../../../application/DTOs/admin/specializationDTO";
import { changeSpecializationStatusRequestDTO } from "../../../application/DTOs/admin/changeSpecializationStatusDTO";
import { IGetSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement.ts/IGetSpecializationsUsecase";
import { GetSpecializationRequestDTO } from "../../../application/DTOs/admin/getSpecializationRequestDTO";
import { logger } from "../../../utils/logger";
import {
  addSpecializationSchema,
  editSpecializationSchema,
} from "../../validators/adminValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class AdminController {
  constructor(
    private _addSpecializationUsecase: IAddSpecializationUsecase,
    private _activateSpecializaitonUsecase: IActivateSpecializationUsecase,
    private _deactivateSpecializationUsecase: IDeactivateSpecializationUsecase,
    private _editSpecializationUsecase: IEditSpecializationUsecase,
    private _getSpecializationUsecase: IGetSpecializationUsecase
  ) {}

  async getSpecializations(req: Request, res: Response, next: NextFunction) {
    try {
      const query: GetSpecializationRequestDTO = {
        search: req.query.search ? (req.query.search as string) : "",
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 9,
        sort: req.query.sort ? (req.query.sort as string) : "",
      };
      const specializations = await this._getSpecializationUsecase.execute(
        query
      );
      res.json({
        success: true,
        message: "Specializations retreived successfully",
        ...specializations,
      });
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
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      await this._addSpecializationUsecase.execute(data.data);
      return res.json({
        success: true,
        message: "Specialization added successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - addSpecialization");
      next(error);
    }
  }

  async activateSpecialization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data: changeSpecializationStatusRequestDTO = {
        id: req.params.id,
      };
      await this._activateSpecializaitonUsecase.execute(data);
      return res.json({
        success: true,
        message: "Specialization activated successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin Controller - activateSpecialization");
      next(error);
    }
  }

  async deactivateSpecialization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data: changeSpecializationStatusRequestDTO = {
        id: req.params.id,
      };
      await this._deactivateSpecializationUsecase.execute(data);
      return res.json({
        success: true,
        message: "Specialization de-activated successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin Controller - activateSpecialization");
      next(error);
    }
  }

  async editSpecialization(req: Request, res: Response, next: NextFunction) {
    try {
      const data = editSpecializationSchema.safeParse(req.body);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const nameRegex = /^[A-Za-z][A-Za-z\s&-]{1,49}$/;
      const descRegex = /^[A-Za-z0-9\s.,()&-]{10,200}$/;
      if (
        !nameRegex.test(data.data.name) ||
        !descRegex.test(data.data.description)
      ) {
        throw new Error("Invalid data");
      }
      await this._editSpecializationUsecase.execute(data.data);
      return res.json({
        success: true,
        message: "Specialization updated successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin Controller - editSpecialization");
      next(error);
    }
  }
}
