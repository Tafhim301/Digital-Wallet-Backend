import { model, Schema } from "mongoose";
import { ITransaction, Status, TransactionType } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    sender: { type: Schema.Types.ObjectId ,ref : "User" },
    receiver: { type: Schema.Types.ObjectId, ref : "User" },
    amount: {
      type: Number,
      min: [1, "Amount must be getter  than 0"],
      required: true,
    },
    transactionType: { type: String, enum: TransactionType, required: true },
    status: {
      type: String,
      enum: Status,
      default: Status.PENDING,
      required: true,
    },
    failure_reason: {
      type: String,
      
      
      
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
