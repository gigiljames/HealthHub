import { z } from "zod";

export const createOrUpdateReviewSchema = z.object({
  appointmentId: z.string().trim().min(1, "Appointment ID is required."),
  answers: z.object({
    q1: z.enum(["Excellent", "Good", "Average", "Poor"]),
    q2: z.enum(["Excellent", "Good", "Average", "Poor"]),
    q3: z.enum(["Excellent", "Good", "Average", "Poor"]),
    q4: z.enum(["Excellent", "Good", "Average", "Poor"]),
    q5: z.enum(["Excellent", "Good", "Average", "Poor"]),
  }),
  comment: z.string().trim().optional(),
  isAnonymous: z.boolean().default(false),
});

export const doctorListReviewsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default("1").transform(Number),
    limit: z.string().regex(/^\d+$/).optional().default("10").transform(Number),
    scoreMin: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().regex(/^\d+$/).optional().transform((val) => val !== undefined ? Number(val) : undefined),
    ),
    scoreMax: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().regex(/^\d+$/).optional().transform((val) => val !== undefined ? Number(val) : undefined),
    ),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const adminListReviewsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default("1").transform(Number),
    limit: z.string().regex(/^\d+$/).optional().default("10").transform(Number),
    search: z.string().optional(),
    doctorName: z.string().optional(),
    patientName: z.string().optional(),
    scoreMin: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().regex(/^\d+$/).optional().transform((val) => val !== undefined ? Number(val) : undefined),
    ),
    scoreMax: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().regex(/^\d+$/).optional().transform((val) => val !== undefined ? Number(val) : undefined),
    ),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
