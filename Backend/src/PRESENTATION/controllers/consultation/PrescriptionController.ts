import { NextFunction, Request, Response } from "express";
import { ICreatePrescriptionUseCase } from "../../../domain/interfaces/usecases/consultation/ICreatePrescriptionUseCase";
import { IGetPrescriptionByAppointmentIdUseCase } from "../../../domain/interfaces/usecases/consultation/IGetPrescriptionByAppointmentIdUseCase";
import { IGetPrescriptionByIdUseCase } from "../../../domain/interfaces/usecases/consultation/IGetPrescriptionByIdUseCase";
import { IListPrescriptionsUseCase } from "../../../domain/interfaces/usecases/consultation/IListPrescriptionsUseCase";
import { IAppointmentRepository } from "../../../domain/interfaces/repositories/IAppointmentRepository";
import { createPrescriptionSchema, listPrescriptionsSchema } from "../../validators/prescriptionValidator";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { Roles } from "../../../domain/enums/roles";
import { MESSAGES } from "../../../domain/constants/messages";

export class PrescriptionController {
  constructor(
    private readonly _createPrescriptionUseCase: ICreatePrescriptionUseCase,
    private readonly _getPrescriptionByAppointmentIdUseCase: IGetPrescriptionByAppointmentIdUseCase,
    private readonly _getPrescriptionByIdUseCase: IGetPrescriptionByIdUseCase,
    private readonly _listPrescriptionsUseCase: IListPrescriptionsUseCase,
    private readonly _appointmentRepository: IAppointmentRepository,
  ) { }

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

      res.status(HttpStatusCodes.CREATED).json({
        success: true,
        message: "Prescription created successfully.",
        data: result,
      });
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

      const result = await this._getPrescriptionByAppointmentIdUseCase.execute(appointmentId);
      if (!result) {
        throw new CustomError(HttpStatusCodes.NOT_FOUND, "Prescription not found for this appointment.");
      }

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
      });
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

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
      });
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

      const { page, limit, search, specialization, startDate, endDate, patientId } = parsed.data.query;

      const result = await this._listPrescriptionsUseCase.execute(userId, role, page, limit, {
        search,
        specialization,
        startDate,
        endDate,
        patientId,
      });

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
