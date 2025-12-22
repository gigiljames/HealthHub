import { z } from "zod";
import { Gender } from "../../domain/enums/gender";
import { DoctorWorkType } from "../../domain/enums/doctorWorkTypes";

export const doctorProfileBasicInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  specialization: z.string().min(1, "Specialization is required"),
  gender: z.enum(Gender),
  dob: z.string().transform((str) => new Date(str)),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
});

export const doctorProfileEducationSchema = z.object({
  education: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      institution: z.string().min(1, "Institution is required"),
      graduationYear: z.number().min(1900, "Invalid graduation year"),
      description: z.string().min(1, "Description is required"),
    })
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
    })
  ),
});
