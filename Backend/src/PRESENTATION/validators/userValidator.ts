import { z } from "zod";
import { MaritalStatus } from "../../domain/enums/maritalStatus";
import { Gender } from "../../domain/enums/gender";
import { BloodGroup } from "../../domain/enums/bloodGroup";

export const UProfileCreation1RequestSchema = z.object({
  userId: z.string(),
  maritalStatus: z.enum(MaritalStatus),
  gender: z.enum(Gender),
  dob: z.date(),
  bloodGroup: z.enum(BloodGroup),
  allergies: z
    .array(z.string().min(1, "Allergy name cannot be empty"))
    .default([]),
  occupation: z.string().min(2, "Occupation is too short"),
});

export const UProfileCreation2RequestSchema = z.object({
  userId: z.string(),
  height: z.number().positive("Height must be a positive number"),
  weight: z.number().positive("Weight must be a positive number"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
});

export const UProfileCreation3RequestSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid userId."),
  tb: z.boolean(),
  bronchialAsthma: z.boolean(),
  epilepsy: z.boolean(),
});

export const SurgerySchema = z.object({
  year: z
    .number()
    .int()
    .min(1900, { message: "Year must be greater than or equal to 1900" })
    .max(new Date().getFullYear(), { message: "Year cannot be in the future" }),
  surgeryName: z.string().min(1, { message: "Surgery name is required" }),
  reason: z.string().min(1, { message: "Reason is required" }),
  surgeryType: z.enum(["major", "minor"], {
    message: "Surgery type must be either 'major' or 'minor'",
  }),
  hospital: z.string().min(1, { message: "Hospital name is required" }),
  doctor: z.string().min(1, { message: "Doctor name is required" }),
});

export const UProfileCreation4RequestSchema = z.object({
  userId: z.string(),
  surgeries: z.array(SurgerySchema),
});
