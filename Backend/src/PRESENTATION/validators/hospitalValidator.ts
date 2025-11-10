import { z } from "zod";

export const HProfileCreation1RequestSchema = z.object({
  hospitalId: z.string(),
  type: z.string(),
  establishedYear: z
    .number()
    .optional()
    .refine((val) => !val || val > 1800),
  about: z.string().optional(),
  profileImage: z.any().optional(),
});

export const HProfileCreation2RequestSchema = z.object({
  hospitalId: z.string(),
  address: z.string().min(5),
  phone: z.string().min(10),
  email: z.email(),
  website: z.string().optional(),
  location: z.array(z.number()).length(2),
  workingHours: z.string().optional(),
});

export const HProfileCreation3RequestSchema = z.object({
  hospitalId: z.string(),
  hospitalRegistration: z.any().optional(),
  gstCertificate: z.any().optional(),
});

export const HProfileCreation4RequestSchema = z.object({
  hospitalId: z.string(),
  features: z.array(z.string().min(1)).min(1),
});

export const HProfileCreation5RequestSchema = z.object({
  hospitalId: z.string(),
  acceptedTerms: z.boolean(),
  submissionDate: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val))
    .refine((date) => !isNaN(date.getTime())),
});
