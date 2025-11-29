import { NextFunction, Request, Response } from "express";
import { IActivateSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement/IActivateSpecializationUsecase";
import { IAddSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement/IAddSpecializationUsecase";
import { IDeactivateSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement/IDeactivateSpecializationUsecase";
import { IEditSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement/IEditSpecializationUsecase";
import { IGetSpecializationUsecase } from "../../../domain/interfaces/usecases/admin/specializationManagement/IGetSpecializationsUsecase";
import { IGetUsersUsecase } from "../../../domain/interfaces/usecases/admin/userManagement/IGetUsersUsecase";
import { IGetUserProfileUsecase } from "../../../domain/interfaces/usecases/admin/userManagement/IGetUserProfileUsecase";
import { IBlockUserUsecase } from "../../../domain/interfaces/usecases/admin/userManagement/IBlockUserUsecase";
import { IUnblockUserUsecase } from "../../../domain/interfaces/usecases/admin/userManagement/IUnblockUserUsecase";
import { specializationResponseDTO } from "../../../application/DTOs/admin/specializationDTO";
import { changeSpecializationStatusRequestDTO } from "../../../application/DTOs/admin/changeSpecializationStatusDTO";
import { GetSpecializationRequestDTO } from "../../../application/DTOs/admin/getSpecializationRequestDTO";
import { GetUsersRequestDTO } from "../../../application/DTOs/admin/userManagementDTO";
import { logger } from "../../../utils/logger";
import {
  addSpecializationSchema,
  editSpecializationSchema,
  getDoctorsSchema,
  getHospitalsSchema,
} from "../../validators/adminValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IGetDoctorsUsecase } from "../../../domain/interfaces/usecases/admin/doctorManagement/IGetDoctorsUsecase";
import { IBlockDoctorUsecase } from "../../../domain/interfaces/usecases/admin/doctorManagement/IBlockDoctorUsecase";
import { IUnblockDoctorUsecase } from "../../../domain/interfaces/usecases/admin/doctorManagement/IUnblockDoctorUsecase";
import { IGetHospitalsUsecase } from "../../../domain/interfaces/usecases/admin/hospitalManagement/IGetHospitalsUsecase";
import { IBlockHospitalUsecase } from "../../../domain/interfaces/usecases/admin/hospitalManagement/IBlockHospitalUsecase";
import { IUnblockHospitalUsecase } from "../../../domain/interfaces/usecases/admin/hospitalManagement/IUnblockHospitalUsecase";

export class AdminController {
  constructor(
    private _addSpecializationUsecase: IAddSpecializationUsecase,
    private _activateSpecializaitonUsecase: IActivateSpecializationUsecase,
    private _deactivateSpecializationUsecase: IDeactivateSpecializationUsecase,
    private _editSpecializationUsecase: IEditSpecializationUsecase,
    private _getSpecializationUsecase: IGetSpecializationUsecase,
    private _getUsersUsecase: IGetUsersUsecase,
    private _getUserProfileUsecase: IGetUserProfileUsecase,
    private _blockUserUsecase: IBlockUserUsecase,
    private _unblockUserUsecase: IUnblockUserUsecase,
    private _getDoctorsUsecase: IGetDoctorsUsecase,
    private _blockDoctorUsecase: IBlockDoctorUsecase,
    private _unblockDoctorUsecase: IUnblockDoctorUsecase,
    private _getHospitalsUsecase: IGetHospitalsUsecase,
    private _blockHospitalUsecase: IBlockHospitalUsecase,
    private _unblockHospitalUsecase: IUnblockHospitalUsecase
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

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query: GetUsersRequestDTO = {
        search: req.query.search ? (req.query.search as string) : "",
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sort: req.query.sort ? (req.query.sort as string) : "",
        blocked: req.query.blocked === "true" ? true : undefined,
        unblocked: req.query.unblocked === "true" ? true : undefined,
        newUser: req.query.newUser === "true" ? true : undefined,
      };
      const users = await this._getUsersUsecase.execute(query);
      res.json({
        success: true,
        message: "Users retrieved successfully",
        ...users,
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - getUsers");
      next(error);
    }
  }

  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const userProfile = await this._getUserProfileUsecase.execute(userId);
      res.json({
        success: true,
        message: "User profile retrieved successfully",
        user: userProfile,
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - getUserProfile");
      next(error);
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      await this._blockUserUsecase.execute({ id: userId });
      res.json({
        success: true,
        message: "User blocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - blockUser");
      next(error);
    }
  }

  async unblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      await this._unblockUserUsecase.execute({ id: userId });
      res.json({
        success: true,
        message: "User unblocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - unblockUser");
      next(error);
    }
  }

  async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getDoctorsSchema.safeParse(req.query);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY
        );
      }
      const doctors = await this._getDoctorsUsecase.execute(data.data);
      res.json({
        success: true,
        message: "Doctors retrieved successfully",
        ...doctors,
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - getDoctors");
      next(error);
    }
  }

  async getHospitals(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getHospitalsSchema.safeParse(req.query);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST
        );
      }
      const hospitals = await this._getHospitalsUsecase.execute(data.data);
      res.json({
        success: true,
        message: "Hospitals retrieved successfully",
        ...hospitals,
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - getHospitals");
      next(error);
    }
  }

  async blockDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      await this._blockDoctorUsecase.execute(doctorId);
      res.json({
        success: true,
        message: "Doctor blocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - blockDoctor");
      next(error);
    }
  }

  async blockHospital(req: Request, res: Response, next: NextFunction) {
    try {
      const hospitalId = req.params.id;
      await this._blockHospitalUsecase.execute(hospitalId);
      res.json({
        success: true,
        message: "Hospital blocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - blockHospital");
      next(error);
    }
  }

  async unblockDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      await this._unblockDoctorUsecase.execute(doctorId);
      res.json({
        success: true,
        message: "Doctor unblocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - unblockDoctor");
      next(error);
    }
  }

  async unblockHospital(req: Request, res: Response, next: NextFunction) {
    try {
      const hospitalId = req.params.id;
      await this._unblockHospitalUsecase.execute(hospitalId);
      res.json({
        success: true,
        message: "Hospital unblocked successfully",
      });
    } catch (error) {
      logger.error("ERROR: Admin controller - unblockHospital");
      next(error);
    }
  }
}
