import { z } from "zod";

export const cancelDoctorAppointmentSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .trim()
      .min(5, "Reason must be at least 5 characters long.")
      .max(500, "Reason must be less than 500 characters."),
  }),
});

export const adminAppointmentListSchema = z.object({
  query: z.object({
    tab: z
      .enum(["ALL", "UPCOMING", "PAST", "CANCELLED", "COMPLETED"])
      .optional()
      .default("ALL"),
    search: z.string().optional(),
    status: z.string().optional(),
    mode: z.string().optional(),
    timeRange: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sort: z.string().optional(),
    paymentStatus: z.string().optional(),
    doctorId: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional().default("1").transform(Number),
    limit: z.string().regex(/^\d+$/).optional().default("10").transform(Number),
  }),
});
