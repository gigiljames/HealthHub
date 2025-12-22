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

export const getHospitalsSchema = z.object({
  search: z.string().optional().default(""),
  page: z
    .string()
    .regex(/^\d+$/, { message: "Page must be a positive integer" })
    .transform(Number)
    .refine((val) => val > 0, { message: "Page must be greater than 0" })
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/, { message: "Limit must be a positive integer" })
    .transform(Number)
    .refine((val) => val > 0, { message: "Limit must be greater than 0" })
    .default(10),
  sort: z.enum(["name-asc", "name-desc", ""]).optional().default(""),
  blocked: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  unblocked: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  verified: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  notVerified: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  newUser: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  profileCompleted: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});

export const getDoctorsSchema = z.object({
  search: z.string().optional().default(""),
  page: z
    .string()
    .regex(/^\d+$/, { message: "Page must be a positive integer" })
    .transform(Number)
    .refine((val) => val > 0, { message: "Page must be greater than 0" })
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/, { message: "Limit must be a positive integer" })
    .transform(Number)
    .refine((val) => val > 0, { message: "Limit must be greater than 0" })
    .default(10),
  sort: z.enum(["name-asc", "name-desc", ""]).optional().default(""),
  blocked: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  unblocked: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  verified: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  notVerified: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  newUser: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  profileCompleted: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});
