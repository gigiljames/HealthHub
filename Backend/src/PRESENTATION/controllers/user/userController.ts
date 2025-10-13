import { NextFunction, Request, Response } from "express";
import { IUProfileCreation1Usecase } from "../../../DOMAIN/interfaces/usecases/user/IUProfileCreation1Usecase";
import { IUProfileCreation2Usecase } from "../../../DOMAIN/interfaces/usecases/user/IUProfileCreation2Usecase";
import { IUProfileCreation3Usecase } from "../../../DOMAIN/interfaces/usecases/user/IUProfileCreation3Usecase";
import { IUProfileCreation4Usecase } from "../../../DOMAIN/interfaces/usecases/user/IUProfileCreation4Usecase";
import {
  UProfileCreation1DTO,
  UProfileCreation2DTO,
  UProfileCreation3DTO,
  UProfileCreation4DTO,
} from "../../../APPLICATION/DTOs/user/userProfileCreationDTO";
import { IUGetProfileStage1Usecase } from "../../../DOMAIN/interfaces/usecases/user/IUGetProfileStage1Usecase";
import { IUGetProfileStage2Usecase } from "../../../DOMAIN/interfaces/usecases/user/IUGetProfileStage2Usecase";
import { IUGetProfileStage3Usecase } from "../../../DOMAIN/interfaces/usecases/user/IUGetProfileStage3Usecase";
import { IUGetProfileStage4Usecase } from "../../../DOMAIN/interfaces/usecases/user/IUGetProfileStage4Usecase";
import { logger } from "../../../utils/logger";

export class UserController {
  constructor(
    private _uProfileCreation1Usecase: IUProfileCreation1Usecase,
    private _uProfileCreation2Usecase: IUProfileCreation2Usecase,
    private _uProfileCreation3Usecase: IUProfileCreation3Usecase,
    private _uProfileCreation4Usecase: IUProfileCreation4Usecase,
    private _uGetProfileStage1Usecase: IUGetProfileStage1Usecase,
    private _uGetProfileStage2Usecase: IUGetProfileStage2Usecase,
    private _uGetProfileStage3Usecase: IUGetProfileStage3Usecase,
    private _uGetProfileStage4Usecase: IUGetProfileStage4Usecase
  ) {}

  async getProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const data = await this._uGetProfileStage1Usecase.execute(userId);
      res.json({
        success: true,
        data,
        message: "Profile stage 1 fetched successfully.",
      });
    } catch (error) {
      logger.error("ERROR: User controller - getProfileStage1");
      next(error);
    }
  }

  async getProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const data = await this._uGetProfileStage2Usecase.execute(userId);
      res.json({
        success: true,
        data,
        message: "Profile stage 2 fetched successfully.",
      });
    } catch (error) {
      logger.error("ERROR: User controller - getProfileStage2");
      next(error);
    }
  }

  async getProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const data = await this._uGetProfileStage3Usecase.execute(userId);
      res.json({
        success: true,
        data,
        message: "Profile stage 3 fetched successfully.",
      });
    } catch (error) {
      logger.error("ERROR: User controller - getProfileStage3");
      next(error);
    }
  }

  async getProfileStage4(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const data = await this._uGetProfileStage4Usecase.execute(userId);

      res.json({
        success: true,
        data,
        message: "Profile stage 4 fetched successfully.",
      });
    } catch (error) {
      logger.error("ERROR: User controller - getProfileStage4");
      next(error);
    }
  }

  async saveProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const data: UProfileCreation1DTO = {
        userId: body.userId,
        gender: body.gender,
        maritalStatus: body.maritalStatus,
        bloodGroup: body.bloodGroup,
        dob: body.dob,
        allergies: body.allergies,
        occupation: body.occupation,
      };
      // data validation here
      await this._uProfileCreation1Usecase.execute(data);
      res.json({
        success: true,
        message: "Saved successfully",
      });
    } catch (error) {
      logger.error("ERROR: User controller - saveProfileStage1");
      next(error);
    }
  }

  async saveProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const data: UProfileCreation2DTO = {
        userId: body.userId,
        height: body.height,
        weight: body.weight,
        address: body.address,
        phoneNumber: body.phoneNumber,
      };
      // data validation here
      const returnData = await this._uProfileCreation2Usecase.execute(data);
      res.json({
        success: true,
        message: "Saved successfully",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: User controller - saveProfileStage2");
      next(error);
    }
  }

  async saveProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const data: UProfileCreation3DTO = {
        userId: body.userId,
        tb: body.tb,
        bronchialAsthma: body.bronchialAsthma,
        epilepsy: body.epilepsy,
      };
      // data validation here
      const returnData = await this._uProfileCreation3Usecase.execute(data);
      res.json({
        success: true,
        message: "Saved successfully",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: User controller - saveProfileStage3");
      next(error);
    }
  }

  async saveProfileStage4(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const data: UProfileCreation4DTO = {
        userId: body.userId,
        surgeries: body.surgeries,
      };
      // data validation here
      const returnData = await this._uProfileCreation4Usecase.execute(data);
      res.json({
        success: true,
        message: "Profile creation completed.",
        data: returnData,
      });
    } catch (error) {
      logger.error("ERROR: User controller - saveProfileStage4");
      next(error);
    }
  }
}
