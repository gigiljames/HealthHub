import { NextFunction, Request, Response } from "express";
import { ICreatePrescriptionUseCase } from "../../../domain/interfaces/usecases/consultation/ICreatePrescriptionUseCase";
import { IGetPrescriptionByAppointmentIdUseCase } from "../../../domain/interfaces/usecases/consultation/IGetPrescriptionByAppointmentIdUseCase";
import { IGetPrescriptionByIdUseCase } from "../../../domain/interfaces/usecases/consultation/IGetPrescriptionByIdUseCase";
import { IListPrescriptionsUseCase } from "../../../domain/interfaces/usecases/consultation/IListPrescriptionsUseCase";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { IVerifyPrescriptionUseCase } from "../../../domain/interfaces/usecases/consultation/IVerifyPrescriptionUseCase";
import { IRevokePrescriptionUseCase } from "../../../domain/interfaces/usecases/consultation/IRevokePrescriptionUseCase";
import { createPrescriptionSchema, listPrescriptionsSchema } from "../../validators/prescriptionValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { Roles } from "../../../domain/enums/roles";
import { MESSAGES } from "../../../domain/constants/messages";
import { consultationModel } from "../../../infrastructure/DB/models/consultationModel";
import { slotModel } from "../../../infrastructure/DB/models/slotModel";
import { appointmentModel } from "../../../infrastructure/DB/models/appointmentModel";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class PrescriptionController {
  constructor(
    private readonly _createPrescriptionUseCase: ICreatePrescriptionUseCase,
    private readonly _getPrescriptionByAppointmentIdUseCase: IGetPrescriptionByAppointmentIdUseCase,
    private readonly _getPrescriptionByIdUseCase: IGetPrescriptionByIdUseCase,
    private readonly _listPrescriptionsUseCase: IListPrescriptionsUseCase,
    private readonly _verifyPrescriptionUseCase: IVerifyPrescriptionUseCase,
    private readonly _revokePrescriptionUseCase: IRevokePrescriptionUseCase,
    private readonly _appointmentRepository: IAppointmentRepository,
  ) { }

  private validateAccess = async (req: Request, appointmentId: string): Promise<void> => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) {
      throw new CustomError(HttpStatusCodes.UNAUTHORIZED, "Unauthorized.");
    }

    const appointment = await this._appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found.");
    }

    // 1. If the logged in user is the patient of the record, they can access it at any time.
    if (appointment.patientId.toString() === userId) {
      return;
    }

    // 2. If the user is a doctor, they must have an in-progress consultation with this patient.
    // In-progress means patient has joined, and endedAt is null.
    if (role === Roles.DOCTOR) {
      const inProgressConsultation = await consultationModel.findOne({
        doctorId: userId,
        patientId: appointment.patientId,
        patientJoinedAt: { $ne: null },
        endedAt: null,
      }).lean();

      if (inProgressConsultation) {
        return;
      }

      // Check if a consultation has been created between this doctor and patient but the patient has not joined yet.
      const existingConsultation = await consultationModel.findOne({
        doctorId: userId,
        patientId: appointment.patientId,
        endedAt: null,
      }).lean();

      if (existingConsultation && !existingConsultation.patientJoinedAt) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          "Access to medical records is restricted until the patient has joined the consultation.",
        );
      }

      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        "Access to medical records is only allowed when consultation is in progress.",
      );
    }

    // 3. Fallback/Forbidden for any other roles/users
    throw new CustomError(HttpStatusCodes.FORBIDDEN, "Access to medical records is restricted.");
  };

  createPrescription = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = req.user?.userId;
      const role = req.user?.role;

      if (!doctorId || role !== Roles.DOCTOR) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }

      const parsed = createPrescriptionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          parsed.error.message || MESSAGES.INVALID_REQUEST_BODY,
        );
      }

      const { appointmentId, medicines } = parsed.data;

      const appointment = await this._appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new CustomError(HttpStatusCodes.NOT_FOUND, "Appointment not found.");
      }

      if (appointment.doctorId !== doctorId) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          "You are not authorized to create a prescription for this appointment.",
        );
      }

      const result = await this._createPrescriptionUseCase.execute({
        appointmentId,
        patientId: appointment.patientId,
        doctorId,
        medicines,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.CREATED,
        "Prescription created successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  getPrescriptionByAppointmentId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      if (!appointmentId) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Appointment ID is required.");
      }

      // Perform security access validation
      await this.validateAccess(req, appointmentId);

      const result = await this._getPrescriptionByAppointmentIdUseCase.execute(appointmentId);
      if (!result) {
        throw new CustomError(HttpStatusCodes.NOT_FOUND, "Prescription not found for this appointment.");
      }

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Prescription fetched successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  getPrescriptionById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Prescription ID is required.");
      }

      const result = await this._getPrescriptionByIdUseCase.execute(id);
      if (!result) {
        throw new CustomError(HttpStatusCodes.NOT_FOUND, "Prescription not found.");
      }

      // Perform security access validation
      await this.validateAccess(req, result.appointmentId);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Prescription fetched successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  listPrescriptions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId || !role) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }

      const parsed = listPrescriptionsSchema.safeParse(req);
      if (!parsed.success) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, MESSAGES.INVALID_REQUEST_BODY);
      }

      const { page, limit, search, specialization, startDate, endDate, patientId, doctorId } = parsed.data.query;

      const result = await this._listPrescriptionsUseCase.execute(userId, role, page, limit, {
        search,
        specialization,
        startDate,
        endDate,
        patientId,
        doctorId,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Prescriptions listed successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  verifyPrescription = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { verificationToken } = req.params;
      if (!verificationToken) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Verification token is required.");
      }

      const result = await this._verifyPrescriptionUseCase.execute(verificationToken);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Prescription verified successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  revokePrescription = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const doctorId = req.user?.userId;
      const role = req.user?.role;

      if (!doctorId || role !== Roles.DOCTOR) {
        throw new CustomError(HttpStatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
      }

      const { id } = req.params;
      if (!id) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Prescription ID is required.");
      }

      const result = await this._revokePrescriptionUseCase.execute(id, doctorId);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Prescription revoked successfully.",
        result,
      );
    } catch (error) {
      next(error);
    }
  };
}

