import { IGetSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetSlotsUsecase";
import { ICreateSlotUsecase } from "../../../domain/interfaces/usecases/slot/ICreateSlotUsecase";
import { IEditSlotUsecase } from "../../../domain/interfaces/usecases/slot/IEditSlotUsecase";
import { IDeleteSlotUsecase } from "../../../domain/interfaces/usecases/slot/IDeleteSlotUsecase";
import { ICreateRecurringSlotsUsecase } from "../../../domain/interfaces/usecases/slot/ICreateRecurringSlotsUsecase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import {
  getFullCalendarSlotsDTOSchema,
  recurringSlotsDTOSchema,
  slotDTOSchema,
} from "../../validators/slotValidator";
import { IGetFullCalendarSlotsUsecase } from "../../../domain/interfaces/usecases/slot/IGetFullCalendarSlotsUsecase";

export class SlotController {
  constructor(
    private readonly _getSlotsUsecase: IGetSlotsUsecase,
    private readonly _createSlotUsecase: ICreateSlotUsecase,
    private readonly _createRecurringSlotsUsecase: ICreateRecurringSlotsUsecase,
    private readonly _editSlotUsecase: IEditSlotUsecase,
    private readonly _deleteSlotUsecase: IDeleteSlotUsecase,
    private readonly _getFullCalendarSlotsUsecase: IGetFullCalendarSlotsUsecase,
  ) {}

  async getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const slots = await this._getSlotsUsecase.execute(req.params.doctorId);
      res.json({
        success: true,
        slots,
        message: MESSAGES.SLOT.SLOTS_FETCHED,
      });
    } catch (error) {
      logger.error("ERROR: Doctor controller - getSlots");
      next(error);
    }
  }

  async getFullCalendarSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = getFullCalendarSlotsDTOSchema.safeParse(req.body);
      // console.log(validation);
      if (!validation.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          validation.error.issues[0].message,
        );
      }
      const slots = await this._getFullCalendarSlotsUsecase.execute(
        validation.data,
      );
      res.json({
        success: true,
        data: slots,
        message: MESSAGES.SLOT.SLOTS_FETCHED,
      });
    } catch (error) {
      logger.error("ERROR: Doctor controller - getFullCalendarSlots");
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
        res.json({
          slot,
          success: true,
          message: MESSAGES.SLOT.CREATED,
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - createSlot");
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
        res.json({
          slots,
          success: true,
          message: MESSAGES.SLOT.CREATED,
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - createRecurringSlots");
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
        res.json({
          slot,
          success: true,
          message: MESSAGES.SLOT.UPDATED,
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - editSlot");
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
        res.json({
          id,
          success: true,
          message: MESSAGES.SLOT.DELETED,
        });
      } else {
        throw new CustomError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      }
    } catch (error) {
      logger.error("ERROR: Doctor controller - deleteSlot");
      next(error);
    }
  }
}
