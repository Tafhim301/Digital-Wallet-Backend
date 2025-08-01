import { Types } from "mongoose";

export enum TransactionType {
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  TOP_UP = "TOP_UP",
  WITHDRAW = "WITHDRAW",
  SEND_MONEY = "SEND_MONEY",
  ADMIN_CASH_IN = "ADMIN_CASH_IN",
}

export interface ITransaction {
  _id?: Types.ObjectId;
  sender: Types.ObjectId | "Admin";
  receiever: Types.ObjectId;
  amount: number;
  transactionType: TransactionType;
}
