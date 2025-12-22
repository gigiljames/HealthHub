import { z } from "zod";
import { MaritalStatus } from "../../domain/enums/maritalStatus";
import { Gender } from "../../domain/enums/gender";
import { BloodGroup } from "../../domain/enums/bloodGroup";

export const UProfileCreation1RequestSchema = z.object({
  userId: z.string(),
  maritalStatus: z.enum(MaritalStatus),
  gender: z.enum(Gender),
  dob: z.string().transform((dob) => new Date(dob)),
  bloodGroup: z.enum(BloodGroup),
  allergies: z.array(z.string().min(1)).default([]),
  occupation: z.string().min(2),
});

export const UProfileCreation2RequestSchema = z.object({
  userId: z.string(),
  height: z.string().transform((height) => Number(height)),
  weight: z.string().transform((weight) => Number(weight)),
  address: z.string().min(5),
  phoneNumber: z.string().regex(/^\d{10}$/),
});

export const UProfileCreation3RequestSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  tb: z.boolean(),
  bronchialAsthma: z.boolean(),
  epilepsy: z.boolean(),
});

export const SurgerySchema = z.object({
  year: z.string().transform((year) => Number(year)),
  surgeryName: z.string().min(1),
  reason: z.string().min(1),
  surgeryType: z.enum(["major", "minor"]),
  hospital: z.string().min(1),
  doctor: z.string().min(1),
});

export const UProfileCreation4RequestSchema = z.object({
  userId: z.string(),
  surgeries: z.array(SurgerySchema),
});
