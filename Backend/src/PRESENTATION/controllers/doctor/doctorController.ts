import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { IGetAllDoctorsUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IGetAllDoctorsUsecase";
import { IBlockDoctorUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IBlockDoctorUsecase";
import { IUnblockDoctorUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IUnblockDoctorUsecase";
import { IGetDoctorProfileUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IGetDoctorProfileUsecase";
import { IVerifyDoctorUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IVerifyDoctorUsecase";
import { IDOnboardingStep6Usecase } from "../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDOnboardingStep6Usecase";
import { IDProfileBasicInfoUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileBasicInfoUsecase";
import { IDProfileEducationUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileEducationUsecase";
import { IDProfileExperienceUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDProfileExperienceUsecase";
import { IDGetProfileBasicInfoUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileBasicInfoUsecase";
import { IDGetProfileEducationUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileEducationUsecase";
import { IDGetProfileExperienceUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileExperienceUsecase";
import {
  doctorOnboardingStep4Schema,
  doctorProfileBasicInfoSchema,
  doctorProfileEducationSchema,
  doctorProfileExperienceSchema,
  doctorS3SignedUrlRequestSchema,
  doctorSetupPracticeSchema,
  doctorVerificationDocsSchema,
  getDoctorsRequestSchema,
  getDoctorsSchema,
  updateBannerImageSchema,
} from "../../validators/doctorValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { IDSetupPractice } from "../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDSetupPractice";
import { IDOnboardingStep4Usecase } from "../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDOnboardingStep4Usecase";
import { IDGetOnboardingStep4Usecase } from "../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDGetOnboardingStep4Usecase";
import { IDGetMedicalLicenseUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetMedicalLicenseUploadSignedUrlUsecase";
import { IDGetDegreeCertificateUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetDegreeCertificateUploadSignedUrlUsecase";
import { IDSaveVerificationDocsUsecase } from "../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDSaveVerificationDocsUsecase";
import { IDGetVerificationDocsUsecase } from "../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDGetVerificationDocsUsecase";
import { IDResubmitProfileUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDResubmitProfileUsecase";
import { IDGetAllPracticeLocationsUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetAllPracticeLocationsUsecase";
import { IDGetPracticeLocationsUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetPracticeLocationsUsecase";
import { IGetPublicDoctorsUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IGetPublicDoctorsUsecase";
import { IGetPublicDoctorProfileUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IGetPublicDoctorProfileUsecase";
import { IDUpdateBannerImageUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDUpdateBannerImageUsecase";
import { IDUpdateProfileImageUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDUpdateProfileImageUsecase";
import { updateProfileImageSchema } from "../../validators/sharedValidator";
import { IDGetBannerImageUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetBannerImageUploadSignedUrlUsecase";
import { IDGetProfileImageUploadSignedUrlUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileImageUploadSignedUrlUsecase";
import { IDGetProfileImageAccessUrlUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetProfileImageAccessUrlUsecase";
import { IDGetBannerImageAccessUrlUsecase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetBannerImageAccessUrlUsecase";
import { IDGetPracticeDetails } from "../../../domain/interfaces/usecases/doctor/doctorOnboarding/IDGetPracticeDetails";
import { IGetDoctorAnalyticsUsecase } from "../../../domain/interfaces/usecases/doctor/doctorManagement/IGetDoctorAnalyticsUsecase";
import { IDGetSignatureUploadUrlUseCase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDGetSignatureUploadUrlUseCase";
import { IDSaveSignatureUseCase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDSaveSignatureUseCase";
import { IDSaveMedicalRegistrationUseCase } from "../../../domain/interfaces/usecases/doctor/doctorProfile/IDSaveMedicalRegistrationUseCase";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class DoctorController {
  constructor(
    private readonly _getAllDoctorsUsecase: IGetAllDoctorsUsecase,
    private readonly _getPublicDoctorsUsecase: IGetPublicDoctorsUsecase,
    private readonly _getPublicDoctorProfileUsecase: IGetPublicDoctorProfileUsecase,
    private readonly _blockDoctorUsecase: IBlockDoctorUsecase,
    private readonly _unblockDoctorUsecase: IUnblockDoctorUsecase,
    private readonly _getDoctorProfileUsecase: IGetDoctorProfileUsecase,
    private readonly _verifyDoctorUsecase: IVerifyDoctorUsecase,
    private readonly _dProfileBasicInfoUsecase: IDProfileBasicInfoUsecase,
    private readonly _dProfileEducationUsecase: IDProfileEducationUsecase,
    private readonly _dProfileExperienceUsecase: IDProfileExperienceUsecase,
    private readonly _dGetProfileBasicInfoUsecase: IDGetProfileBasicInfoUsecase,
    private readonly _dGetProfileEducationUsecase: IDGetProfileEducationUsecase,
    private readonly _dGetProfileExperienceUsecase: IDGetProfileExperienceUsecase,
    private readonly _dGetMedicalLicenseUploadSignedUrlUsecase: IDGetMedicalLicenseUploadSignedUrlUsecase,
    private readonly _dGetDegreeCertificateUploadSignedUrlUsecase: IDGetDegreeCertificateUploadSignedUrlUsecase,
    private readonly _dGetProfileImageUploadSignedUrlUsecase: IDGetProfileImageUploadSignedUrlUsecase,
    private readonly _dGetBannerImageUploadSignedUrlUsecase: IDGetBannerImageUploadSignedUrlUsecase,
    private readonly _dGetVerificationDocsUsecase: IDGetVerificationDocsUsecase,
    private readonly _dSaveVerificationDocsUsecase: IDSaveVerificationDocsUsecase,
    private readonly _dGetPracticeDetails: IDGetPracticeDetails,
    private readonly _dSetupPractice: IDSetupPractice,
    private readonly _dGetPracticeLocationsUsecase: IDGetPracticeLocationsUsecase,
    private readonly _dGetAllPracticeLocationsUsecase: IDGetAllPracticeLocationsUsecase,
    private readonly _dGetOnboardingStep4Usecase: IDGetOnboardingStep4Usecase,
    private readonly _dOnboardingStep4Usecase: IDOnboardingStep4Usecase,
    private readonly _dOnboardingStep6Usecase: IDOnboardingStep6Usecase,
    private readonly _dResubmitProfileUsecase: IDResubmitProfileUsecase,
    private readonly _dUpdateProfileImageUsecase: IDUpdateProfileImageUsecase,
    private readonly _dUpdateBannerImageUsecase: IDUpdateBannerImageUsecase,
    private readonly _dGetProfileImageAccessUrlUsecase: IDGetProfileImageAccessUrlUsecase,
    private readonly _dGetBannerImageAccessUrlUsecase: IDGetBannerImageAccessUrlUsecase,
    private readonly _getDoctorAnalyticsUseCase: IGetDoctorAnalyticsUsecase,
    private readonly _dGetSignatureUploadUrlUseCase: IDGetSignatureUploadUrlUseCase,
    private readonly _dSaveSignatureUseCase: IDSaveSignatureUseCase,
    private readonly _dSaveMedicalRegistrationUseCase: IDSaveMedicalRegistrationUseCase,
  ) {}

  async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getDoctorsSchema.safeParse(req.query);
      if (data.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      const doctors = await this._getAllDoctorsUsecase.execute(data.data);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Doctors retrieved successfully",
        doctors,
      );
    } catch (error) {
      logger.error("ERROR: Admin controller - getDoctors");
      next(error);
    }
  }

  async getPublicDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = getDoctorsRequestSchema.safeParse(req.query);
      if (validation.error) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }
      const doctors = await this._getPublicDoctorsUsecase.execute(
        validation.data,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Doctors retrieved successfully",
        doctors,
      );
    } catch (error) {
      logger.error("ERROR: Admin controller - getDoctors");
      next(error);
    }
  }

  async getPublicDoctorProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const doctor = await this._getPublicDoctorProfileUsecase.execute(id);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Doctor profile fetched successfully",
        { doctor },
      );
    } catch (error) {
      logger.error("ERROR: Admin controller - getPublicDoctorProfile");
      next(error);
    }
  }

  async getDoctorProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const doctor = await this._getDoctorProfileUsecase.execute(id);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Doctor profile fetched successfully",
        { doctor },
      );
    } catch (error) {
      logger.error("ERROR: Admin controller - getDoctorProfile");
      next(error);
    }
  }

  async blockDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      if (!doctorId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      await this._blockDoctorUsecase.execute(doctorId);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Doctor blocked successfully",
      );
    } catch (error) {
      logger.error("ERROR: Admin controller - blockDoctor");
      next(error);
    }
  }

  async unblockDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      if (!doctorId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      await this._unblockDoctorUsecase.execute(doctorId);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Doctor unblocked successfully",
      );
    } catch (error) {
      logger.error("ERROR: Admin controller - unblockDoctor");
      next(error);
    }
  }

  async verifyDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      if (!doctorId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const { isApproved, verificationRemarks } = req.body;

      if (
        typeof isApproved !== "boolean" ||
        (isApproved === false && !verificationRemarks)
      ) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }

      await this._verifyDoctorUsecase.execute(
        doctorId,
        isApproved,
        verificationRemarks,
      );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        isApproved
          ? "Doctor verified successfully"
          : "Doctor verification rejected",
      );
    } catch (error) {
      logger.error("ERROR: Admin controller - verifyDoctor");
      next(error);
    }
  }

  async saveProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = doctorProfileBasicInfoSchema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }

      if (req.user) {
        await this._dProfileBasicInfoUsecase.execute(
          validation.data,
          req.user.userId,
        );

        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile stage 1 saved successfully.",
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveProfileStage1");
      next(error);
    }
  }

  async saveProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = doctorProfileEducationSchema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }

      if (req.user) {
        await this._dProfileEducationUsecase.execute(
          validation.data,
          req.user.userId,
        );

        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile stage 2 saved successfully.",
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveProfileStage2");
      next(error);
    }
  }

  async saveProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = doctorProfileExperienceSchema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }

      if (req.user) {
        await this._dProfileExperienceUsecase.execute(
          validation.data,
          req.user.userId,
        );

        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile stage 3 saved successfully.",
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveProfileStage3");
      next(error);
    }
  }

  async getProfileStage1(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetProfileBasicInfoUsecase.execute(
          req.user.userId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile stage 1 fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getProfileStage1");
      next(error);
    }
  }

  async getProfileStage2(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetProfileEducationUsecase.execute(
          req.user.userId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile stage 2 fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getProfileStage2");
      next(error);
    }
  }

  async getProfileStage3(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetProfileExperienceUsecase.execute(
          req.user.userId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile stage 3 fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getProfileStage3");
      next(error);
    }
  }

  async saveOnboardingStep6(req: Request, res: Response, next: NextFunction) {
    try {
      const { acceptedTerms, submissionDate } = req.body;

      if (acceptedTerms === undefined || !submissionDate) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.INVALID_REQUEST_BODY,
        );
      }

      if (req.user) {
        await this._dOnboardingStep6Usecase.execute({
          userId: req.user.userId,
          acceptedTerms,
          submissionDate: new Date(submissionDate),
        });

        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Onboarding completed successfully.",
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveOnboardingStep6");
      next(error);
    }
  }

  async getDegreeCertificateUploadSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const validation = doctorS3SignedUrlRequestSchema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const data =
          await this._dGetDegreeCertificateUploadSignedUrlUsecase.execute(
            validation.data.doctorId,
            validation.data.filename,
            validation.data.contentType,
          );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Degree certificate upload signed URL fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error(
        "ERROR: Doctor controller - getDegreeCertificateUploadSignedUrl",
      );
      next(error);
    }
  }

  async getMedicalLicenseUploadSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const validation = doctorS3SignedUrlRequestSchema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const data =
          await this._dGetMedicalLicenseUploadSignedUrlUsecase.execute(
            validation.data.doctorId,
            validation.data.filename,
            validation.data.contentType,
          );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Medical license upload signed URL fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error(
        "ERROR: Doctor controller - getMedicalLicenseUploadSignedUrl",
      );
      next(error);
    }
  }

  async getProfileImageUploadSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const validation = doctorS3SignedUrlRequestSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const data = await this._dGetProfileImageUploadSignedUrlUsecase.execute(
          validation.data.doctorId,
          validation.data.filename,
          validation.data.contentType,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile image upload signed URL fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getProfileImageUploadSignedUrl");
      next(error);
    }
  }

  async getBannerImageUploadSignedUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const validation = doctorS3SignedUrlRequestSchema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const data = await this._dGetBannerImageUploadSignedUrlUsecase.execute(
          validation.data.doctorId,
          validation.data.filename,
          validation.data.contentType,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Banner image upload signed URL fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getBannerImageUploadSignedUrl");
      next(error);
    }
  }

  async getVerificationDocs(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetVerificationDocsUsecase.execute(
          req.user.userId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Verification docs fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getVerificationDocs");
      next(error);
    }
  }

  async saveVerificationDocs(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = doctorVerificationDocsSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const response = await this._dSaveVerificationDocsUsecase.execute(
          req.user.userId,
          validation.data.medicalLicenseKey,
          validation.data.degreeCertificateKey,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Verification docs saved successfully.",
          response,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveVerificationDocs");
      next(error);
    }
  }

  async getPracticeDetails(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetPracticeDetails.execute(req.user.userId);
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Practice details fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getPracticeDetails");
      next(error);
    }
  }

  async setupPractice(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = doctorSetupPracticeSchema.safeParse(req.body);
      // console.log(validation);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        await this._dSetupPractice.execute(req.user.userId, validation.data);
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Practice set up successfully.",
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - setupPractice");
      next(error);
    }
  }

  async getPracticeLocations(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetPracticeLocationsUsecase.execute(
          req.user.userId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Practice locations fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getPracticeLocations");
      next(error);
    }
  }

  async getAllPracticeLocations(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (req.user) {
        const data = await this._dGetAllPracticeLocationsUsecase.execute(
          req.user.userId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "All practice locations fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getAllPracticeLocations");
      next(error);
    }
  }

  async getOnboardingStep4(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const data = await this._dGetOnboardingStep4Usecase.execute(
          req.user.userId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Onboarding step 4 fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getOnboardingStep4");
      next(error);
    }
  }

  async saveOnboardingStep4(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = doctorOnboardingStep4Schema.safeParse(req.body);

      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        await this._dOnboardingStep4Usecase.execute(
          req.user.userId,
          validation.data,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Onboarding step 4 completed successfully.",
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveOnboardingStep4");
      next(error);
    }
  }

  async resubmitProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await this._dResubmitProfileUsecase.execute(req.user.userId);
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile resubmitted successfully.",
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - resubmitProfile");
      next(error);
    }
  }

  async updateProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const validation = updateProfileImageSchema.safeParse(req.body);
        if (!validation.success) {
          throw new CustomError(
            HttpStatusCodes.BAD_REQUEST,
            validation.error.issues[0].message,
          );
        }
        await this._dUpdateProfileImageUsecase.execute(validation.data);
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile image updated successfully.",
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - updateProfileImage");
      next(error);
    }
  }

  async updateBannerImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const validation = updateBannerImageSchema.safeParse(req.body);
        if (!validation.success) {
          throw new CustomError(
            HttpStatusCodes.BAD_REQUEST,
            validation.error.issues[0].message,
          );
        }
        await this._dUpdateBannerImageUsecase.execute(validation.data);
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Banner image updated successfully.",
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - updateBannerImage");
      next(error);
    }
  }

  async getProfileImageAccessUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (req.user) {
        const profileImageAccessUrl =
          await this._dGetProfileImageAccessUrlUsecase.execute(req.user.userId);
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Profile image access url fetched successfully.",
          profileImageAccessUrl,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getProfileImageAccessUrl");
      next(error);
    }
  }

  async getBannerImageAccessUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (req.user) {
        const bannerImageAccessUrl =
          await this._dGetBannerImageAccessUrlUsecase.execute(req.user.userId);
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Banner image access url fetched successfully.",
          bannerImageAccessUrl,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getBannerImageAccessUrl");
      next(error);
    }
  }

  async getDoctorAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      if (!doctorId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const analytics = await this._getDoctorAnalyticsUseCase.execute(doctorId);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Doctor analytics fetched successfully",
        analytics,
      );
    } catch (error) {
      logger.error("ERROR: Doctor controller - getDoctorAnalytics");
      next(error);
    }
  }

  async getSignatureUploadUrl(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const validation = doctorS3SignedUrlRequestSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        if (validation.data.doctorId !== req.user.userId) {
          throw new CustomError(HttpStatusCodes.FORBIDDEN, MESSAGES.UNAUTHORIZED);
        }
        const data = await this._dGetSignatureUploadUrlUseCase.execute(
          validation.data.doctorId,
          validation.data.filename,
          validation.data.contentType,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Signature upload signed URL fetched successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - getSignatureUploadUrl");
      next(error);
    }
  }

  async saveSignature(req: Request, res: Response, next: NextFunction) {
    try {
      const { signatureKey } = req.body;
      if (!signatureKey) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Signature key is required.");
      }
      if (req.user) {
        const data = await this._dSaveSignatureUseCase.execute(
          req.user.userId,
          signatureKey,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Signature saved successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveSignature");
      next(error);
    }
  }

  async saveRegistrationNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { registrationNumber } = req.body;
      if (registrationNumber === undefined) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Registration number is required.");
      }
      if (req.user) {
        const data = await this._dSaveMedicalRegistrationUseCase.execute(
          req.user.userId,
          registrationNumber,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Registration number saved successfully.",
          data,
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - saveRegistrationNumber");
      next(error);
    }
  }
}
