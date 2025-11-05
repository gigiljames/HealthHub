import { z } from "zod";
import { Roles } from "../../domain/enums/roles";

export const GoogleAuthRequestSchema = z.object({
  token: z
    .string()
    .min(1, "Google token is required")
    .regex(/^[\w-]+\.[\w-]+\.[\w-]+$/, "Invalid Google token format"),
  role: z.enum(Roles),
});

export const AuthRequestSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters")
    .optional(),
  email: z.email("Invalid email address").min(1, "Email is required"),
  role: z.enum(Roles),
  password: z.string().optional(),
});

export const CompleteSignupRequestSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters"),

  email: z.email("Invalid email format").min(1, "Email is required"),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
      "Invalid password"
    )
    .optional(),
  role: z.enum(Roles),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const ResetPasswordRequestSchema = z.object({
  token: z
    .string()
    .regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
      "Invalid JWT token format"
    )
    .min(10, "Token seems too short to be a valid JWT"),
  email: z.email("Invalid email format").min(1, "Email is required"),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
      "Invalid password"
    ),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.email("Invalid email format").min(1, "Email is required"),
});

export const ForgotPasswordVerifyOtpRequestSchema = z.object({
  email: z.email("Invalid email format").min(1, "Email is required"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});
