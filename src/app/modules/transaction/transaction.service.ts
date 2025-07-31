import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHandlers/appError";
import { User } from "../user/user.model";
import { ITransaction, TransactionType } from "./transaction.interface";
import { Transaction } from "./transaction.model";
import { Wallet } from "../wallet/wallet.model";
import { isWalletBlocked } from "../../utils/checkTransactionValidity";
import { Role } from "../user/user.interface";

const sendMoney = async (
  userToken: JwtPayload,
  payload: Partial<ITransaction>
) => {
  const senderId = userToken.userId;
 

  const user = await User.findById(senderId);
  
  await isWalletBlocked(senderId, "Sender");

  if (!user) throw new AppError(404, "User not found");

  const userWallet = await Wallet.findById(user.wallet);
  if (!userWallet) throw new AppError(404, "Sender's wallet not found");

  const { reciever, amount } = payload;
  if (!reciever || !amount) {
    throw new AppError(400, "Receiver and amount are required");
  }

  if (userWallet.balance < amount) {
    throw new AppError(400, "Insufficient balance");
  }
  const receiverUser = await User.findOne({ phone: reciever });
  await isWalletBlocked(receiverUser?.id, "Receiver");

  if (!receiverUser) {
    throw new AppError(
      404,
      "Receiver not found. Amount has not been deducted."
    );
  }
  if (receiverUser.role === Role.AGENT) {
    throw new AppError(
      400,
      "You can't send money to an agent.Use Cash Out instead."
    );
  }

  const receiverWallet = await Wallet.findById(receiverUser.wallet);
  if (!receiverWallet) {
    throw new AppError(404, "Receiver's wallet not found");
  }

  userWallet.balance -= amount;
  receiverWallet.balance += amount;

  await userWallet.save();
  await receiverWallet.save();

  const transaction = await Transaction.create({
    sender: senderId,
    reciever: receiverUser._id,
    amount,
    TransactionType: TransactionType.SEND_MONEY,
  });

  return transaction;
};

export const transactionServices = {
  sendMoney,
};
