import { z } from "zod";

export const emailSchema = z.string().email();

export const firstNameSchema = z.string().min(3);

export const passwordSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter",
  });

export const usernameSchema = z
  .string()
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(20, { message: "Username must be at most 20 characters long" })
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message:
      "Username can only contain letters, numbers, underscores, and hyphens",
  });
