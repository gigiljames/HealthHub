import { z } from "zod";

export const slotDTOSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  mode: z.enum(["in-person", "online"]),
  practiceLocationId: z.string(),
  isBooked: z.boolean(),
});

export const recurringSlotsDTOSchema = z.object({
  title: z.string(),
  start: z.string(),
  end: z.string(),
  mode: z.enum(["in-person", "online"]),
  practiceLocationId: z.string(),
  recurMode: z.enum(["this-week", "every-this-day", "this-month"]),
});

export const getFullCalendarSlotsDTOSchema = z.object({
  doctorId: z.string(),
  startDate: z.string(),
  days: z.number(),
});

export const getSlotsDTOSchema = z.object({
  doctorId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export const createScheduleRuleDTOSchema = z.object({
  title: z.string(),
  practiceLocationId: z.string(),
  mode: z.enum(["online", "in-person"]),
  duration: z.number().positive(),
  buffer: z.number().nonnegative(),
  rruleString: z.string(),
  validFrom: z.string(),
  validTo: z.string().nullable(),
  startHour: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endHour: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

export const editScheduleRuleDTOSchema = createScheduleRuleDTOSchema.partial().extend({
  id: z.string(),
});

export const createDoctorExceptionDTOSchema = z.object({
  reason: z.string(),
  startDatetime: z.string(),
  endDatetime: z.string(),
});
