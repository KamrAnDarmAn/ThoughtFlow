import z from "zod";

export const loginSchema = z.object({
  email: z.email().min(6, { message: "Required" }),
  password: z.string().min(6, { message: "Password at least 6 characters" }),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().optional(),
  avatar: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      return allowedTypes.includes(file.type);
    }, "Avatar must be a JPEG, PNG, or GIF file"),
});
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
