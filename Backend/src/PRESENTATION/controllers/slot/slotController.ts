import { IGetSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetSlotsUsecase";
import { ICreateSlotUsecase } from "../../../domain/interfaces/usecases/slot/ICreateSlotUsecase";
import { IEditSlotUsecase } from "../../../domain/interfaces/usecases/slot/IEditSlotUsecase";
import { IDeleteSlotUsecase } from "../../../domain/interfaces/usecases/slot/IDeleteSlotUsecase";
import { ICreateRecurringSlotsUsecase } from "../../../domain/interfaces/usecases/slot/ICreateRecurringSlotsUsecase";
import { IGetFullCalendarSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetFullCalendarSlotsUsecase";
import { ICreateScheduleRuleUsecase } from "../../../domain/interfaces/usecases/slot/ICreateScheduleRuleUsecase";
import { IGetScheduleRulesUsecase } from "../../../domain/interfaces/usecases/slot/IGetScheduleRulesUsecase";
import { IEditScheduleRuleUsecase } from "../../../domain/interfaces/usecases/slot/IEditScheduleRuleUsecase";
import { IDeleteScheduleRuleUsecase } from "../../../domain/interfaces/usecases/slot/IDeleteScheduleRuleUsecase";
import { IToggleScheduleRuleUsecase } from "../../../domain/interfaces/usecases/slot/IToggleScheduleRuleUsecase";
import { ICreateDoctorExceptionUsecase } from "../../../domain/interfaces/usecases/slot/ICreateDoctorExceptionUsecase";
import { IGetDoctorExceptionsUsecase } from "../../../domain/interfaces/usecases/slot/IGetDoctorExceptionsUsecase";
import { IDeleteDoctorExceptionUsecase } from "../../../domain/interfaces/usecases/slot/IDeleteDoctorExceptionUsecase";
import { IEditDoctorExceptionUsecase } from "../../../domain/interfaces/usecases/slot/IEditDoctorExceptionUsecase";
import { IBlockSlotUsecase } from "../../../domain/interfaces/usecases/slot/IBlockSlotUsecase";
import { IUnblockSlotUsecase } from "../../../domain/interfaces/usecases/slot/IUnblockSlotUsecase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { Roles } from "../../../domain/enums/roles";
import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";
import {
  createDoctorExceptionDTOSchema,
  createScheduleRuleDTOSchema,
  editScheduleRuleDTOSchema,
  getFullCalendarSlotsDTOSchema,
  recurringSlotsDTOSchema,
  slotDTOSchema,
} from "../../validators/slotValidator";

export class SlotController {
  constructor(
    private readonly _getSlotsUsecase: IGetSlotsUsecase,
    private readonly _createSlotUsecase: ICreateSlotUsecase,
    private readonly _createRecurringSlotsUsecase: ICreateRecurringSlotsUsecase,
    private readonly _editSlotUsecase: IEditSlotUsecase,
    private readonly _deleteSlotUsecase: IDeleteSlotUsecase,
    private readonly _getFullCalendarSlotsUsecase: IGetFullCalendarSlotsUsecase,
    private readonly _createScheduleRuleUsecase: ICreateScheduleRuleUsecase,
    private readonly _getScheduleRulesUsecase: IGetScheduleRulesUsecase,
    private readonly _editScheduleRuleUsecase: IEditScheduleRuleUsecase,
    private readonly _deleteScheduleRuleUsecase: IDeleteScheduleRuleUsecase,
    private readonly _toggleScheduleRuleUsecase: IToggleScheduleRuleUsecase,
    private readonly _createDoctorExceptionUsecase: ICreateDoctorExceptionUsecase,
    private readonly _getDoctorExceptionsUsecase: IGetDoctorExceptionsUsecase,
    private readonly _deleteDoctorExceptionUsecase: IDeleteDoctorExceptionUsecase,
    private readonly _editDoctorExceptionUsecase: IEditDoctorExceptionUsecase,
    private readonly _blockSlotUsecase: IBlockSlotUsecase,
    private readonly _unblockSlotUsecase: IUnblockSlotUsecase,
  ) {}

  async getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.doctorId;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!startDate || !endDate) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          "startDate and endDate query parameters are required",
        );
      }

      const excludePast = req.user?.role === Roles.USER;

      const slots = await this._getSlotsUsecase.execute({
        doctorId,
        startDate,
        endDate,
        excludePast,
      });
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SLOT.SLOTS_FETCHED,
        { slots },
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - getSlots");
      next(error);
    }
  }

  async getFullCalendarSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = getFullCalendarSlotsDTOSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      const excludePast = req.user?.role === Roles.USER;
      const slots = await this._getFullCalendarSlotsUsecase.execute({
        ...validation.data,
        future: excludePast,
      });
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SLOT.SLOTS_FETCHED,
        slots,
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - getFullCalendarSlots");
      next(error);
    }
  }

  async createSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = slotDTOSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const doctorId = req.user.userId;
        const slot = await this._createSlotUsecase.execute(
          validation.data,
          doctorId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.SLOT.CREATED,
          { slot },
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Slot controller - createSlot");
      next(error);
    }
  }

  async createRecurringSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = recurringSlotsDTOSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const doctorId = req.user.userId;
        const slots = await this._createRecurringSlotsUsecase.execute(
          validation.data,
          doctorId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.SLOT.CREATED,
          { slots },
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Slot controller - createRecurringSlots");
      next(error);
    }
  }

  async editSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = slotDTOSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const slot = await this._editSlotUsecase.execute(validation.data);
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.SLOT.UPDATED,
          { slot },
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Slot controller - editSlot");
      next(error);
    }
  }

  async deleteSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slotId = req.params.id;
      if (!slotId) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      if (req.user) {
        const id = await this._deleteSlotUsecase.execute(slotId);
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.SLOT.DELETED,
          { id },
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Slot controller - deleteSlot");
      next(error);
    }
  }

  async getScheduleRules(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.doctorId;
      const rules = await this._getScheduleRulesUsecase.execute(doctorId);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SCHEDULE_RULE.RULES_FETCHED,
        { rules },
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - getScheduleRules");
      next(error);
    }
  }

  async createScheduleRule(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createScheduleRuleDTOSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const doctorId = req.user.userId;
        const rule = await this._createScheduleRuleUsecase.execute(
          validation.data,
          doctorId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.SCHEDULE_RULE.CREATED,
          { rule },
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Slot controller - createScheduleRule");
      next(error);
    }
  }

  async editScheduleRule(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = editScheduleRuleDTOSchema.safeParse(req.body);
      if (!validation.success) {
        console.log(validation.error);
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      const rule = await this._editScheduleRuleUsecase.execute({
        ...validation.data,
        id: req.params.id,
      });
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SCHEDULE_RULE.UPDATED,
        { rule },
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - editScheduleRule");
      next(error);
    }
  }

  async deleteScheduleRule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await this._deleteScheduleRuleUsecase.execute(req.params.id);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SCHEDULE_RULE.DELETED,
        { id },
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - deleteScheduleRule");
      next(error);
    }
  }

  async toggleScheduleRule(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await this._toggleScheduleRuleUsecase.execute(req.params.id);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        rule.isActive
          ? MESSAGES.SCHEDULE_RULE.ENABLED
          : MESSAGES.SCHEDULE_RULE.DISABLED,
        { rule },
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - toggleScheduleRule");
      next(error);
    }
  }

  async getDoctorExceptions(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.doctorId;
      const exceptions =
        await this._getDoctorExceptionsUsecase.execute(doctorId);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.DOCTOR_EXCEPTION.EXCEPTIONS_FETCHED,
        { exceptions },
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - getDoctorExceptions");
      next(error);
    }
  }

  async createDoctorException(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createDoctorExceptionDTOSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const doctorId = req.user.userId;
        const exception = await this._createDoctorExceptionUsecase.execute(
          validation.data,
          doctorId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          MESSAGES.DOCTOR_EXCEPTION.CREATED,
          { exception },
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Slot controller - createDoctorException");
      next(error);
    }
  }

  async deleteDoctorException(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await this._deleteDoctorExceptionUsecase.execute(
        req.params.id,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.DOCTOR_EXCEPTION.DELETED,
        { id },
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - deleteDoctorException");
      next(error);
    }
  }

  async editDoctorException(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createDoctorExceptionDTOSchema.safeParse(req.body);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      if (req.user) {
        const doctorId = req.user.userId;
        const exception = await this._editDoctorExceptionUsecase.execute(
          req.params.id,
          validation.data,
          doctorId,
        );
        HTTPResponseBuilder.buildSuccessResponse(
          req,
          res,
          HttpStatusCodes.OK,
          "Holiday updated successfully",
          { exception },
        );
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Slot controller - editDoctorException");
      next(error);
    }
  }

  async blockSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await this._blockSlotUsecase.execute(req.params.id);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SLOT.BLOCKED,
        { slot },
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - blockSlot");
      next(error);
    }
  }

  async unblockSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await this._unblockSlotUsecase.execute(req.params.id);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.SLOT.UNBLOCKED,
        { slot },
      );
    } catch (error) {
      logger.error("ERROR: Slot controller - unblockSlot");
      next(error);
    }
  }
}

