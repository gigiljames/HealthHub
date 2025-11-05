import { z } from "zod";

export const addSpecializationSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const editSpecializationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});
