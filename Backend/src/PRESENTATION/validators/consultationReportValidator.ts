import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const createConsultationReportSchema = z.object({
  appointmentId: z.string().trim().min(1, "Appointment ID is required."),
  chiefComplaint: z.string().trim().min(1, "Chief Complaint is required."),
  clinicalNotes: z.string().trim().optional(),
  diagnosis: z.string().trim().min(1, "Diagnosis is required."),
  followUpDate: z.preprocess(
    emptyToUndefined,
    z.string().datetime().or(z.string().date()).optional().nullable(),
  ),
  followUpNotes: z.string().trim().optional(),
});

export const listConsultationReportsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default("1").transform(Number),
    limit: z.string().regex(/^\d+$/).optional().default("10").transform(Number),
    search: z.string().optional(),
    specialization: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    patientId: z.string().optional(),
  }),
});
