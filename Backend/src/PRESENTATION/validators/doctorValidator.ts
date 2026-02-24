import { z } from "zod";
import { Gender } from "../../domain/enums/gender";
import { DoctorWorkType } from "../../domain/enums/doctorWorkTypes";
import { ConsultationModes } from "../../domain/enums/consultationModes";
import { PracticeLocationType } from "../../domain/enums/practiceLocationType";
import { PracticeType } from "../../domain/enums/practiceType";

export const doctorProfileBasicInfoSchema = z.object({
  name: z.string().optional(),
  specialization: z.string().min(1, "Specialization is required"),
  gender: z.enum(Gender),
  dob: z.string().transform((str) => new Date(str)),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  about: z.string().optional(),
});

export const doctorOnboardingStep4Schema = z.object({
  education: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      institution: z.string().min(1, "Institution is required"),
      graduationYear: z.number().min(1900, "Invalid graduation year"),
      description: z.string().min(1, "Description is required"),
    }),
  ),
  experience: z.array(
    z.object({
      designation: z.string().min(1, "Designation is required"),
      hospital: z.string().min(1, "Hospital is required"),
      description: z.string().optional(),
      location: z.string().min(1, "Location is required"),
      present: z.boolean(),
      startDate: z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(1900),
      }),
      endDate: z
        .object({
          month: z.number().min(1).max(12),
          year: z.number().min(1900),
        })
        .optional(),
      type: z.enum(DoctorWorkType),
    }),
  ),
});

export const doctorOnboardingStep5Schema = z.object({
  medicalLicenseKey: z.string().min(1, "Medical license key is required"),
  degreeCertificateKey: z.string().min(1, "Degree certificate key is required"),
});

export const doctorProfileEducationSchema = z.object({
  education: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      institution: z.string().min(1, "Institution is required"),
      graduationYear: z.number().min(1900, "Invalid graduation year"),
      description: z.string().min(1, "Description is required"),
    }),
  ),
});

export const doctorProfileExperienceSchema = z.object({
  experience: z.array(
    z.object({
      designation: z.string().min(1, "Designation is required"),
      hospital: z.string().min(1, "Hospital is required"),
      description: z.string().optional(),
      location: z.string().min(1, "Location is required"),
      present: z.boolean(),
      startDate: z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(1900),
      }),
      endDate: z
        .object({
          month: z.number().min(1).max(12),
          year: z.number().min(1900),
        })
        .optional(),
      type: z.enum(DoctorWorkType),
    }),
  ),
});

export const doctorS3SignedUrlRequestSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  filename: z.string().min(1, "File name is required"),
  contentType: z.string().min(1, "Content type is required"),
});

export const doctorVerificationDocsSchema = z.object({
  medicalLicenseKey: z.string().nullable(),
  degreeCertificateKey: z.string().nullable(),
});

const doctorPracticeLocationSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(PracticeLocationType),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.array(z.number()),
      address: z.string().min(1, "Address is required"),
      placeId: z.string().min(1, "Place ID is required"),
    })
    .optional(),
  consultationFee: z.number(),
  consultationModes: z.array(z.enum(ConsultationModes)),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
});

export const doctorSetupPracticeSchema = z.object({
  consultationFee: z.number().optional(),
  consultationModes: z.array(z.nativeEnum(ConsultationModes)).optional(),
  practiceType: z.nativeEnum(PracticeType),
  practiceLocations: z.array(doctorPracticeLocationSchema).optional(),
});

export const getDoctorsRequestSchema = z.object({
  search: z.string().optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  sort: z.string().optional().default(""),
  rating: z.string().optional().default(""),
  // consultationModes: z.array(z.enum(ConsultationModes)).optional().default([]),
  consultationModes: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val as string) : val),
    z.array(z.enum(ConsultationModes)).optional().default([]),
  ),
  // languages: z.array(z.string()).optional().default([]),
  languages: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val as string) : val),
    z.array(z.string()).optional().default([]),
  ),
  gender: z.enum(Gender).optional().default(Gender.none),
  specialization: z.string().optional().default(""),
  consultationFee: z.coerce.number().optional(),
  location: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val as string) : val),
    z.array(z.coerce.number()).optional().default([]),
  ),
  blocked: z.coerce.boolean().optional(),
  unblocked: z.coerce.boolean().optional(),
  newUser: z.coerce.boolean().optional(),
});

export const updateBannerImageSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  action: z.enum(["SET", "REMOVE"]),
  imageKey: z.string().optional(),
});
