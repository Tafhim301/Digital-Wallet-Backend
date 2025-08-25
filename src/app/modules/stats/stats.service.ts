import { Status, TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";

const getUserStats = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const totalUsersPromise = User.countDocuments();
  const totalActiveUsersPromise = User.countDocuments({ isActive: true });
  const totalInActiveUsersPromise = User.countDocuments({ isActive: false });
  const totalDeletedUsersPromise = User.countDocuments({ isDeleted: true });

  const newUserInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newUserInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const userByRolePromise = User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        role: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);

  const [
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalDeletedUsers,
    newUserInLast7Days,
    newUserInLast30Days,
    userByRole,
  ] = await Promise.all([
    totalUsersPromise,
    totalActiveUsersPromise,
    totalInActiveUsersPromise,
    totalDeletedUsersPromise,
    newUserInLast7DaysPromise,
    newUserInLast30DaysPromise,
    userByRolePromise,
  ]);

  return {
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalDeletedUsers,
    newUserInLast7Days,
    newUserInLast30Days,
    userByRole,
  };
};

const getTransactionStats = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const totalTransactionsPromise = Transaction.countDocuments();
  const totalTopUpPromise = Transaction.countDocuments({
    transactionType: TransactionType.TOP_UP,
  });
  const totalCashInPromise = Transaction.countDocuments({
    transactionType: TransactionType.CASH_IN,
  });
  const totalCashOutPromise = Transaction.countDocuments({
    transactionType: TransactionType.CASH_OUT,
  });
  const totalWithdrawPromise = Transaction.countDocuments({
    transactionType: TransactionType.WITHDRAW,
  });
  const totalSendMoneyPromise = Transaction.countDocuments({
    transactionType: TransactionType.SEND_MONEY,
  });

  const totalTransactionAmountPromise = Transaction.aggregate([
    { $match: { status: Status.SUCCESSFUL } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  const mostActiveUsersPromise = Transaction.aggregate([
    { $group: { _id: "$sender", totalTransactions: { $sum: 1 } } },
    { $sort: { totalTransactions: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        name: "$user.name",
        phone: "$user.phone",
        totalTransactions: 1,
      },
    },
  ]);

  const totalTransactionLast7DaysPromise = Transaction.aggregate([
    {
      $match: { createdAt: { $gte: sevenDaysAgo }, status: Status.SUCCESSFUL },
    },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const totalTransactionLast30DaysPromise = Transaction.aggregate([
    {
      $match: { createdAt: { $gte: thirtyDaysAgo }, status: Status.SUCCESSFUL },
    },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const dailyTransactionsPromise = Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        status: Status.SUCCESSFUL,
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  
  const transactionTypeBreakdownPromise = Transaction.aggregate([
    {
      $match: { status: Status.SUCCESSFUL },
    },
    {
      $group: {
        _id: "$transactionType",
        totalAmount: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  const failedTransactionsPromise = Transaction.countDocuments({
    status: Status.FAILED,
  });

  const avgTransactionSizePromise = Transaction.aggregate([
    { $match: { status: Status.SUCCESSFUL } },
    {
      $group: {
        _id: null,
        averageAmount: { $avg: "$amount" },
      },
    },
  ]);

  const peakTransactionHoursPromise = Transaction.aggregate([
    { $match: { status: Status.SUCCESSFUL } },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        totalTransactions: { $sum: 1 },
      },
    },
    { $sort: { totalTransactions: -1 } },
    {$limit : 5}
  ]);

  const [
    totalTransactions,
    totalTopUp,
    totalCashIn,
    totalCashOut,
    totalWithdraw,
    totalSendMoney,
    totalTransactionAmount,
    mostActiveUsers,
    totalTransactionLast7Days,
    totalTransactionLast30Days,
    failedTransactions,
    avgTransactionSize,
    peakTransactionHours,
    dailyTransactions,
    transactionTypeBreakdown,
  ] = await Promise.all([
    totalTransactionsPromise,
    totalTopUpPromise,
    totalCashInPromise,
    totalCashOutPromise,
    totalWithdrawPromise,
    totalSendMoneyPromise,
    totalTransactionAmountPromise,
    mostActiveUsersPromise,
    totalTransactionLast7DaysPromise,
    totalTransactionLast30DaysPromise,
    failedTransactionsPromise,
    avgTransactionSizePromise,
    peakTransactionHoursPromise,
    dailyTransactionsPromise,
    transactionTypeBreakdownPromise,

  ]);

  return {
    totalTransactions,
    totalTopUp,
    totalCashIn,
    totalCashOut,
    totalWithdraw,
    totalSendMoney,
    totalTransactedAmount: totalTransactionAmount[0]?.totalRevenue || 0,
    mostActiveUsers,
    totalTransactionLast7Days: totalTransactionLast7Days[0] || {
      totalTransactions: 0,
      totalAmount: 0,
    },
    totalTransactionLast30Days: totalTransactionLast30Days[0] || {
      totalTransactions: 0,
      totalAmount: 0,
    },
    failedTransactions,
    avgTransactionSize,
    peakTransactionHours,
    dailyTransactions,
    transactionTypeBreakdown,
  };
};

export const statsService = {
  getUserStats,
  getTransactionStats,
};
