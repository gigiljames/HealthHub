import { z } from "zod";

export const addSpecializationSchema = z.object({
  name: z
    .string()
    .regex(
      /^[A-Za-z][A-Za-z\s&-]{1,49}$/,
      "Name must start with a letter and be 2–50 characters (letters, spaces, & or - only)",
    ),
  description: z
    .string()
    .regex(
      /^[A-Za-z0-9\s.,()&-]{10,200}$/,
      "Description must be 10–200 characters (letters, digits, spaces and .,()&- only)",
    ),
});

export const editSpecializationSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z
    .string()
    .regex(
      /^[A-Za-z][A-Za-z\s&-]{1,49}$/,
      "Name must start with a letter and be 2–50 characters (letters, spaces, & or - only)",
    ),
  description: z
    .string()
    .regex(
      /^[A-Za-z0-9\s.,()&-]{10,200}$/,
      "Description must be 10–200 characters (letters, digits, spaces and .,()&- only)",
    ),
});
