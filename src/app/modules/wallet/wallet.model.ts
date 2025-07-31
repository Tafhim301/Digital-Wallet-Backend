import { model, Schema } from "mongoose";
import { IWallet } from "./wallet.interface";

const walletSchema = new Schema<IWallet>({
    user : {type : Schema.Types.ObjectId ,required : true,unique : true},
    balance : {type : Number ,min : [0,"Balance Must Be positive"], default :50},
    isBlocked : {type : Boolean, default : false}

},{
    timestamps : true,
    versionKey : false
})



export const Wallet = model<IWallet>("Wallet",walletSchema)