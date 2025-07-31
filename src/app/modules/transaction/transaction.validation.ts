import z from "zod";

export const createTransactionSchema = z.object({
    sender : z.string(),
    reciver : z.string(),
    amount : z.number().min(1,'Amount must be greater than 0'),
    

})