import { SlotController } from "../controllers/slot/slotController";
import { SlotRepository } from "../../infrastructure/repositories/slotRepository";
import { ScheduleRuleRepository } from "../../infrastructure/repositories/scheduleRuleRepository";
import { DoctorExceptionRepository } from "../../infrastructure/repositories/doctorExceptionRepository";
import { GetSlotsUsecase } from "../../application/usecases/slot/getSlotsUsecase";
import { CreateSlotUsecase } from "../../application/usecases/slot/createSlotUsecase";
import { EditSlotUsecase } from "../../application/usecases/slot/editSlotUsecase";
import { DeleteSlotUsecase } from "../../application/usecases/slot/deleteSlotUsecase";
import { SlotValidationService } from "../../application/services/slotValidationService";
import { CreateRecurringSlotsUsecase } from "../../application/usecases/slot/createRecurringSlotsUsecase";
import { RRuleService } from "../../application/services/RRuleService";
import { GetFullCalendarSlotsUsecase } from "../../application/usecases/slot/getFullCalendarSlotsUsecase";
import { CreateScheduleRuleUsecase } from "../../application/usecases/slot/createScheduleRuleUsecase";
import { GetScheduleRulesUsecase } from "../../application/usecases/slot/getScheduleRulesUsecase";
import { EditScheduleRuleUsecase } from "../../application/usecases/slot/editScheduleRuleUsecase";
import { DeleteScheduleRuleUsecase } from "../../application/usecases/slot/deleteScheduleRuleUsecase";
import { ToggleScheduleRuleUsecase } from "../../application/usecases/slot/toggleScheduleRuleUsecase";
import { CreateDoctorExceptionUsecase } from "../../application/usecases/slot/createDoctorExceptionUsecase";
import { GetDoctorExceptionsUsecase } from "../../application/usecases/slot/getDoctorExceptionsUsecase";
import { DeleteDoctorExceptionUsecase } from "../../application/usecases/slot/deleteDoctorExceptionUsecase";
import { EditDoctorExceptionUsecase } from "../../application/usecases/slot/editDoctorExceptionUsecase";
import { BlockSlotUsecase } from "../../application/usecases/slot/blockSlotUsecase";
import { UnblockSlotUsecase } from "../../application/usecases/slot/unblockSlotUsecase";

//Repositories
const slotRepository = new SlotRepository();
const scheduleRuleRepository = new ScheduleRuleRepository();
const doctorExceptionRepository = new DoctorExceptionRepository();

//Services
const slotValidationService = new SlotValidationService();
const rRuleService = new RRuleService();

//Usecases
export const getSlotsUsecase = new GetSlotsUsecase(
  slotRepository,
  scheduleRuleRepository,
  doctorExceptionRepository,
  rRuleService,
);
const createSlotUsecase = new CreateSlotUsecase(
  slotRepository,
  slotValidationService,
  doctorExceptionRepository,
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
export const getFullCalendarSlotsUsecase = new GetFullCalendarSlotsUsecase(
  getSlotsUsecase,
);

const createScheduleRuleUsecase = new CreateScheduleRuleUsecase(
  scheduleRuleRepository,
);
const getScheduleRulesUsecase = new GetScheduleRulesUsecase(
  scheduleRuleRepository,
);
const editScheduleRuleUsecase = new EditScheduleRuleUsecase(
  scheduleRuleRepository,
);
const deleteScheduleRuleUsecase = new DeleteScheduleRuleUsecase(
  scheduleRuleRepository,
);
const toggleScheduleRuleUsecase = new ToggleScheduleRuleUsecase(
  scheduleRuleRepository,
);
const createDoctorExceptionUsecase = new CreateDoctorExceptionUsecase(
  doctorExceptionRepository,
);
const getDoctorExceptionsUsecase = new GetDoctorExceptionsUsecase(
  doctorExceptionRepository,
);
const deleteDoctorExceptionUsecase = new DeleteDoctorExceptionUsecase(
  doctorExceptionRepository,
);
const editDoctorExceptionUsecase = new EditDoctorExceptionUsecase(
  doctorExceptionRepository,
);
const blockSlotUsecase = new BlockSlotUsecase(slotRepository);
const unblockSlotUsecase = new UnblockSlotUsecase(slotRepository);

//Controllers
export const injectedSlotController = new SlotController(
  getSlotsUsecase,
  createSlotUsecase,
  createRecurringSlotsUsecase,
  editSlotUsecase,
  deleteSlotUsecase,
  getFullCalendarSlotsUsecase,
  createScheduleRuleUsecase,
  getScheduleRulesUsecase,
  editScheduleRuleUsecase,
  deleteScheduleRuleUsecase,
  toggleScheduleRuleUsecase,
  createDoctorExceptionUsecase,
  getDoctorExceptionsUsecase,
  deleteDoctorExceptionUsecase,
  editDoctorExceptionUsecase,
  blockSlotUsecase,
  unblockSlotUsecase,
);
