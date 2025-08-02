import z from "zod";
const bdPhoneRegex = /^(?:\+880|880|0)1[3-9]\d{8}$/;
export const createTransactionSchema = z.object({
  receiver: z.string().regex(bdPhoneRegex, {
    message: "Invalid Bangladeshi phone number format",
  }),
  amount: z.number().min(1, "Amount must be greater than 0"),
});
