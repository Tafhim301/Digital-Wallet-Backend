import { model, Schema } from "mongoose";
import { ITransaction } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>({
  sender: { type: Schema.Types.ObjectId},
  reciever: { type: Schema.Types.ObjectId, required: true },
  amount: {
    type: Number,
    min: [1, "Amount must be getter  than 0"],
    required: true,
  },
  TransactionType: { type: String, required: true },
},{
    timestamps : true,
    versionKey : false
});

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
