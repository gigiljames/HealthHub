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
