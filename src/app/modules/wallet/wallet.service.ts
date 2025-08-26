import mongoose from "mongoose";
import AppError from "../../errorHandlers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { Wallet } from "./wallet.model";
import {  TransactionType } from "../transaction/transaction.interface";


const getAllWallets = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Wallet.find(), query);

  const users = await queryBuilder.filter().fields().sort().paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return { meta: meta, data: data };
};
const myWallet = async (userId: string) => {
  const user = await User.findById(userId).populate("wallet");

  if (!user) {
    throw new AppError(404, "User Not Found");
  }

  return user;
};

const blockWallet = async (id: string) => {
  const wallet = await Wallet.findById(id);
  
  if (!wallet) {
    throw new AppError(404, "Wallet Not Found");
  }
  const isWalletBlocked = wallet.isBlocked
  const updatedWallet = await Wallet.findByIdAndUpdate(
    id,
    { isBlocked: !isWalletBlocked },
    { new: true }
  );

  return updatedWallet;
};



export const getWalletSummary = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);

 
  const summary = await Transaction.aggregate([
    {
      $match: {
        $or: [{ sender: uid }, { receiver: uid }],
      },
    },
    {
      $group: {
        _id: null,
        cashInTotal: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$transactionType", TransactionType.CASH_IN] },
                  { $or: [{ $eq: ["$receiver", uid] }, { $eq: ["$sender", uid] }] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
        cashOutTotal: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$transactionType", TransactionType.CASH_OUT] },
                  { $or: [{ $eq: ["$receiver", uid] }, { $eq: ["$sender", uid] }] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
        sendMoneyTotal: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$transactionType", TransactionType.SEND_MONEY] },
                  { $or: [{ $eq: ["$sender", uid] }, { $eq: ["$receiver", uid] }] },
                ],
              },
              "$amount",
              0,
            ],
          },
        },
        topUpTotal: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$transactionType", TransactionType.TOP_UP] }, { $eq: ["$sender", uid] }] },
              "$amount",
              0,
            ],
          },
        },
        withdrawTotal: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$transactionType", TransactionType.WITHDRAW] }, { $eq: ["$sender", uid] }] },
              "$amount",
              0,
            ],
          },
        },
      },
    },
  ]);


  const trends = await Transaction.aggregate([
    {
      $match: {
        $or: [{ sender: uid }, { receiver: uid }],
      },
    },
    {
      $group: {
        _id: {
          week: { $week: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        cashIn: {
          $sum: {
            $cond: [
              { $eq: ["$transactionType", TransactionType.CASH_IN] },
              "$amount",
              0,
            ],
          },
        },
        cashOut: {
          $sum: {
            $cond: [
              { $eq: ["$transactionType", TransactionType.CASH_OUT] },
              "$amount",
              0,
            ],
          },
        },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.week": -1 },
    },
  ]);

  const formattedTrends = trends.map((t) => ({
    name: `W${t._id.week}`,
    "Cash In": t.cashIn,
    "Cash Out": t.cashOut,
  }));

  return {
    summary: summary[0] || {
      cashInTotal: 0,
      cashOutTotal: 0,
      sendMoneyTotal: 0,
      topUpTotal: 0,
      withdrawTotal: 0,
    },
    trends: formattedTrends,
  };
};


export const walletServices = {
  getAllWallets,
  blockWallet,
  myWallet,
  getWalletSummary,
};
