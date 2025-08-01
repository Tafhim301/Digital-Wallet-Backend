import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHandlers/appError";
import { User } from "../user/user.model";
import { ITransaction, Status, TransactionType } from "./transaction.interface";
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

  const { receiver, amount } = payload;
  if (!receiver || !amount) {
    throw new AppError(400, "receiver and amount are required");
  }

  if (userWallet.balance < amount) {
    throw new AppError(400, "Insufficient balance");
  }
  const agent = await User.findOne({ phone: receiver });
  await isWalletBlocked(agent?.id, "receiver");

  if (!agent) {
    throw new AppError(
      404,
      "receiver not found. Amount has not been deducted."
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
    throw new AppError(404, "receiver's wallet not found");
  }

  userWallet.balance -= amount;
  receiverWallet.balance += amount;

  await userWallet.save();
  await receiverWallet.save();

  const transaction = await Transaction.create({
    sender: senderId,
    receiver: agent._id,
    amount,
    transactionType: TransactionType.SEND_MONEY,
    status: Status.SUCCESSFUL,
  });

  return transaction;
};
const cashIn = async (
  userToken: JwtPayload,
  payload: Partial<ITransaction>
) => {
  const { receiver, amount } = payload;
  if (!receiver || !amount) {
    throw new AppError(400, "receiver and amount are required");
  }

  const agentId = userToken.userId;

  const agent = await User.findById(agentId);
  if (!agent) throw new AppError(404, "Agent not found");

  if (agent.role !== Role.AGENT) {
    throw new AppError(403, "Only agents can perform cash-in");
  }

  await isWalletBlocked(agentId, "sender");

  const agentWallet = await Wallet.findById(agent.wallet);
  if (!agentWallet) throw new AppError(404, "Agent's wallet not found");

  if (agentWallet.balance < amount) {
    throw new AppError(400, "Insufficient balance");
  }

  const receiverUser = await User.findOne({ phone: receiver });
  if (!receiverUser) {
    throw new AppError(
      404,
      "receiver not found. Amount has not been deducted."
    );
  }

  await isWalletBlocked(receiverUser.id, "receiver");

  if (receiverUser.role === Role.AGENT) {
    throw new AppError(400, "You can't cash-in to another agent.");
  }

  const receiverWallet = await Wallet.findById(receiverUser.wallet);
  if (!receiverWallet) {
    throw new AppError(404, "receiver's wallet not found");
  }

  agentWallet.balance -= amount;
  receiverWallet.balance += amount;

  await agentWallet.save();
  await receiverWallet.save();

  const transaction = await Transaction.create({
    sender: agentId,
    receiver: receiver._id,
    amount,
    transactionType: TransactionType.CASH_IN,
    status: Status.SUCCESSFUL,
  });

  return transaction;
};

const cashOut = async (
  userToken: JwtPayload,
  payload: Partial<ITransaction>
) => {
  const { receiver, amount } = payload;
  if (!receiver || !amount) {
    throw new AppError(400, "receiver and amount are required");
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
  const agent = await User.findOne({ phone: receiver });
  await isWalletBlocked(agent?.id, "receiver");

  if (!agent) {
    throw new AppError(
      404,
      "receiver not found. Amount has not been deducted."
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
    throw new AppError(404, "receiver's wallet not found");
  }

  userWallet.balance -= amount;
  receiverWallet.balance += amount;

  await userWallet.save();
  await receiverWallet.save();

  const transaction = await Transaction.create({
    sender: senderId,
    receiver: agent._id,
    amount,
    transactionType: TransactionType.CASH_OUT,
    status: Status.SUCCESSFUL,
  });

  return transaction;
};

const getAllTransactions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Transaction.find(), query);

  const users = await queryBuilder.filter().fields().sort().paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return { meta: meta, data: data };
};

const getOwnTransactionHistory = async (
  userToken: JwtPayload,
  query: Record<string, string>
) => {
  const userId = userToken.userId;

  const baseFilter = {
    $or: [{ sender: userId }, { receiver: userId }],
  };

  const queryBuilder = new QueryBuilder(Transaction.find(baseFilter), query);

  const transactionsQuery = queryBuilder.filter().sort().fields().paginate();

  const [transactions, meta] = await Promise.all([
    transactionsQuery.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    data: transactions,
  };
};

export const topUp = async (
  userToken: JwtPayload,
  payload: Partial<ITransaction>
) => {
  const { amount } = payload;

  if (!amount || amount <= 0) {
    throw new AppError(400, "Valid top-up amount is required.");
  }

  const userId = userToken.userId;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found.");

  const userWallet = await Wallet.findById(user.wallet);
  if (!userWallet) throw new AppError(404, "Wallet not found.");

  userWallet.balance += amount;
  await userWallet.save();

  const transaction = await Transaction.create({
    sender: userId,
    receiver: userId,
    amount,
    transactionType: TransactionType.TOP_UP,
    status: Status.SUCCESSFUL,
  });

  return transaction;
};

export const withdrawFromATM = async (
  userToken: JwtPayload,
  payload: { amount: number }
) => {
  const { amount } = payload;

  if (!amount || amount <= 0) {
    throw new AppError(400, "Amount must be greater than zero");
  }

  const userId = userToken.userId;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  const wallet = await Wallet.findById(user.wallet);
  if (!wallet) throw new AppError(404, "Wallet not found");

  if (wallet.balance < amount) {
    await Transaction.create({
      sender: user._id,
      receiver: null,
      amount,
      transactionType: TransactionType.WITHDRAW,
      status: Status.FAILED,
      failure_reason: "Insufficient balance",
    });
    throw new AppError(400, "Insufficient balance");
  }

  wallet.balance -= amount;
  await wallet.save();

  const transaction = await Transaction.create({
    sender: user._id,
    receiver: null,
    amount,
    transactionType: TransactionType.WITHDRAW,
    status: Status.SUCCESSFUL,
  });

  return {
    transaction,
  };
};

export const transactionServices = {
  sendMoney,
  cashIn,
  cashOut,
  getAllTransactions,
  getOwnTransactionHistory,
  topUp,
  withdrawFromATM,
};
