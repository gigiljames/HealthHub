import { z } from "zod";

export const updateProfileImageSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  action: z.enum(["SET", "REMOVE"]),
  imageKey: z.string().optional(),
});
