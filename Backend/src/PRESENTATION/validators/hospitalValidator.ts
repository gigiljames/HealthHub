import { z } from "zod";

export const HProfileCreation1RequestSchema = z.object({
  hospitalId: z.string({
    error: (issue) =>
      issue.code === "invalid_type"
        ? "Hospital ID must be a string"
        : "Hospital ID is required",
  }),
  name: z
    .string({
      error: () => "Hospital name is required",
    })
    .min(2, { error: "Hospital name must be at least 2 characters long" }),
  type: z.string({
    error: () => "Hospital type is required",
  }),
  establishedYear: z
    .number()
    .optional()
    .refine((val) => val === undefined || val > 1800, {
      error: "Invalid year",
    }),
  about: z.string().optional(),
  profileImage: z.any().optional(),
});

export const HProfileCreation2RequestSchema = z.object({
  hospitalId: z.string({
    error: () => "Hospital ID is required",
  }),
  address: z
    .string({
      error: () => "Address is required",
    })
    .min(5, { error: "Address must be at least 5 characters" }),
  phone: z
    .string({
      error: () => "Phone number is required",
    })
    .min(7, { error: "Invalid phone number" }),
  email: z
    .string({
      error: () => "Email is required",
    })
    .email({ error: "Invalid email address" }),
  website: z.string().optional(),
  location: z
    .array(z.number(), {
      error: () => "Location coordinates are required and must be numbers",
    })
    .length(2, { error: "Location must have [latitude, longitude]" }),
  workingHours: z.string().optional(),
});

export const HProfileCreation3RequestSchema = z.object({
  hospitalId: z.string({
    error: () => "Hospital ID is required",
  }),
  hospitalRegistration: z.any().optional(),
  gstCertificate: z.any().optional(),
});

export const HProfileCreation4RequestSchema = z.object({
  hospitalId: z.string({
    error: () => "Hospital ID is required",
  }),
  features: z
    .array(z.string().min(1, { error: "Feature must be a non-empty string" }), {
      error: () => "Features must be an array of strings",
    })
    .min(1, { error: "At least one feature must be provided" }),
});

export const HProfileCreation5RequestSchema = z.object({
  hospitalId: z.string({
    error: () => "Hospital ID is required",
  }),
  acceptedTerms: z.boolean({
    error: () => "You must accept the terms and conditions",
  }),
  submissionDate: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val))
    .refine((date) => !isNaN(date.getTime()), {
      error: "Invalid submission date",
    }),
});
