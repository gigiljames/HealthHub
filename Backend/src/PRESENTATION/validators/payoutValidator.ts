import { z } from "zod";

const emptyStringToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const getPayoutsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.preprocess(emptyStringToUndefined, z.string().optional()),
  status: z.preprocess(emptyStringToUndefined, z.string().optional()),
  specialization: z.preprocess(emptyStringToUndefined, z.string().optional()),
  sortBy: z.preprocess(emptyStringToUndefined, z.string().optional()),
  sortOrder: z.preprocess(
    emptyStringToUndefined,
    z.enum(["asc", "desc"]).optional(),
  ),
  startDate: z.preprocess(emptyStringToUndefined, z.string().optional()),
  endDate: z.preprocess(emptyStringToUndefined, z.string().optional()),
});
