import { z } from "zod";

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().trim().min(1, "Appointment ID is required."),
  medicines: z
    .array(
      z.object({
        medicine: z.string().trim().min(1, "Medicine name is required."),
        dosage: z.string().trim().min(1, "Dosage is required."),
        frequency: z.string().trim().min(1, "Frequency is required."),
        timing: z.enum(["Before Food", "After Food"]),
        duration: z.string().trim().min(1, "Duration is required."),
      }),
    )
    .min(1, "Prescription must contain at least one medication."),
});

export const listPrescriptionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default("1").transform(Number),
    limit: z.string().regex(/^\d+$/).optional().default("10").transform(Number),
    search: z.string().optional(),
    specialization: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    patientId: z.string().optional(),
    doctorId: z.string().optional(),
  }),
});
