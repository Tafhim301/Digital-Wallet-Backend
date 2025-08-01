import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHandlers/appError";
import { User } from "../user/user.model";
import { ITransaction, TransactionType } from "./transaction.interface";
import { Transaction } from "./transaction.model";
import { Wallet } from "../wallet/wallet.model";
import { isWalletBlocked } from "../../utils/checkTransactionValidity";
import { Role } from "../user/user.interface";
import { QueryBuilder } from "../../utils/queryBuilder";


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

  const { receiever, amount } = payload;
  if (!receiever || !amount) {
    throw new AppError(400, "Receiver and amount are required");
  }

  if (userWallet.balance < amount) {
    throw new AppError(400, "Insufficient balance");
  }
  const agent = await User.findOne({ phone: receiever });
  await isWalletBlocked(agent?.id, "Receiver");

  if (!agent) {
    throw new AppError(
      404,
      "Receiver not found. Amount has not been deducted."
    );
  }
  if (agent.role === Role.AGENT) {
    throw new AppError(
      400,
      "You can't send money to an agent.Use Cash Out instead."
    );
  }

  const receiverWallet = await Wallet.findById(agent.wallet);
  if (!receiverWallet) {
    throw new AppError(404, "Receiver's wallet not found");
  }

  userWallet.balance -= amount;
  receiverWallet.balance += amount;

  await userWallet.save();
  await receiverWallet.save();

  const transaction = await Transaction.create({
    sender: senderId,
    receiever: agent._id,
    amount,
    transactionType: TransactionType.SEND_MONEY,
  });

  return transaction;
};
const cashIn = async (
  userToken: JwtPayload,
  payload: Partial<ITransaction>
) => {
  const { receiever, amount } = payload;
  if (!receiever || !amount) {
    throw new AppError(400, "Receiver and amount are required");
  }
  const senderId = userToken.userId;

  const sender = await User.findById(senderId);

  if (!sender) throw new AppError(404, "User not found");
  await isWalletBlocked(senderId, "sender");

  const userWallet = await Wallet.findById(sender.wallet);
  if (!userWallet) throw new AppError(404, "sender's wallet not found");

  if (userWallet.balance < amount) {
    throw new AppError(400, "Insufficient balance");
  }
  const agent = await User.findOne({ phone: receiever });
  await isWalletBlocked(agent?.id, "Receiver");

  if (!agent) {
    throw new AppError(
      404,
      "Receiver not found. Amount has not been deducted."
    );
  }
  if (agent.role === Role.AGENT) {
    throw new AppError(400, "You can't perform cash-In for an agent.");
  }

  const receiverWallet = await Wallet.findById(agent.wallet);
  if (!receiverWallet) {
    throw new AppError(404, "Receiver's wallet not found");
  }

  userWallet.balance -= amount;
  receiverWallet.balance += amount;

  await userWallet.save();
  await receiverWallet.save();

  const transaction = await Transaction.create({
    sender: senderId,
    receiever: agent._id,
    amount,
    transactionType: TransactionType.CASH_IN,
  });

  return transaction;
};
const cashOut = async (
  userToken: JwtPayload,
  payload: Partial<ITransaction>
) => {
  const { receiever, amount } = payload;
  if (!receiever || !amount) {
    throw new AppError(400, "Receiver and amount are required");
  }
  const senderId = userToken.userId;

  const sender = await User.findById(senderId);

  if (!sender) throw new AppError(404, "User not found");
  await isWalletBlocked(senderId, "sender");

  const userWallet = await Wallet.findById(sender.wallet);
  if (!userWallet) throw new AppError(404, "sender's wallet not found");

  if (userWallet.balance < amount) {
    throw new AppError(400, "Insufficient balance");
  }
  const agent = await User.findOne({ phone: receiever });
  await isWalletBlocked(agent?.id, "Receiver");

  if (!agent) {
    throw new AppError(
      404,
      "Receiver not found. Amount has not been deducted."
    );
  }
  if (agent.role === Role.USER) {
    throw new AppError(
      400,
      "You can't cash-out from a user.Use send money instead"
    );
  }

  const receiverWallet = await Wallet.findById(agent.wallet);
  if (!receiverWallet) {
    throw new AppError(404, "Receiver's wallet not found");
  }

  userWallet.balance -= amount;
  receiverWallet.balance += amount;

  await userWallet.save();
  await receiverWallet.save();

  const transaction = await Transaction.create({
    sender: senderId,
    receiever: agent._id,
    amount,
    transactionType: TransactionType.CASH_OUT,
  });

  return transaction;
};

const getAllTransactions = async (query : Record<string,string>) => {
  const queryBuilder = new QueryBuilder(Transaction.find(), query);
  
    const users = await queryBuilder
     
      .filter()
      .fields()
      .sort()
      .paginate();
  
    const [data, meta] = await Promise.all([
      users.build(),
      queryBuilder.getMeta(),
    ]);
  
    return { meta: meta, data: data };

};

export const transactionServices = {
  sendMoney,
  cashIn,
  cashOut,
  getAllTransactions
};
