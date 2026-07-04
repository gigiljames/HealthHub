import { z } from "zod";

export const joinConsultationSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, "Appointment ID is required"),
  }),
});

export const endConsultationSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, "Appointment ID is required"),
  }),
});
