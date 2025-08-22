import z from "zod";
const bdPhoneRegex = /^(?:\+880|880|0)1[3-9]\d{8}$/;
export const createUserZodSchema = z.object({
  name: z
    .string({ error: "Name must be string" })
    .min(2, { message: "Name is too short" })
    .max(50, { message: "Name is too long" }),
  phone: z.string().regex(bdPhoneRegex, {
    message: "Invalid Bangladeshi phone number format",
  }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[^a-zA-Z0-9]/.test(val), {
      message: "Password must contain at least one special character",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must contain at least one number",
    }),

  role : z.string()

    
});
