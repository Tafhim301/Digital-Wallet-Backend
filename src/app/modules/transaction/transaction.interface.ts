import { Types } from "mongoose";

export enum TransactionType {

    CASH_IN = "CASH_IN",
    CASH_OUT = "CASH_OUT",
    TOP_UP = "TOP_UP",
    WITHDRAW = "WITHDRAW",
    SEND_MONEY = "SEND_MONEY"


}

export interface ITransaction {
    _id ?: Types.ObjectId
    sender : Types.ObjectId
    reciever : Types.ObjectId
    amount : number
    TransactionType : TransactionType
}