import { SlotController } from "../controllers/slot/slotController";
import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { GetSlotsUsecase } from "../../application/usecases/slot/getSlotsUsecase";
import { CreateSlotUsecase } from "../../application/usecases/slot/createSlotUsecase";
import { EditSlotUsecase } from "../../application/usecases/slot/editSlotUsecase";
import { DeleteSlotUsecase } from "../../application/usecases/slot/deleteSlotUsecase";
import { SlotValidationService } from "../../application/services/slotValidationService";
import { CreateRecurringSlotsUsecase } from "../../application/usecases/slot/createRecurringSlotsUsecase";
import { RRuleService } from "../../application/services/RRuleService";
import { GetFullCalendarSlotsUsecase } from "../../application/usecases/slot/getFullCalendarSlotsUsecase";

//Repositories
const slotRepository = new SlotRepository();

//Services
const slotValidationService = new SlotValidationService();
const rRuleService = new RRuleService();

//Usecases
const getSlotsUsecase = new GetSlotsUsecase(slotRepository);
const createSlotUsecase = new CreateSlotUsecase(
  slotRepository,
  slotValidationService,
);
const createRecurringSlotsUsecase = new CreateRecurringSlotsUsecase(
  slotRepository,
  slotValidationService,
  rRuleService,
);
const editSlotUsecase = new EditSlotUsecase(
  slotRepository,
  slotValidationService,
);
const deleteSlotUsecase = new DeleteSlotUsecase(slotRepository);
const getFullCalendarSlotsUsecase = new GetFullCalendarSlotsUsecase(
  slotRepository,
);

//Controllers
export const injectedSlotController = new SlotController(
  getSlotsUsecase,
  createSlotUsecase,
  createRecurringSlotsUsecase,
  editSlotUsecase,
  deleteSlotUsecase,
  getFullCalendarSlotsUsecase,
);
