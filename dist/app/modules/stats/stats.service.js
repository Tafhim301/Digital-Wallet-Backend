"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsService = void 0;
const transaction_interface_1 = require("../transaction/transaction.interface");
const transaction_model_1 = require("../transaction/transaction.model");
const user_model_1 = require("../user/user.model");
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const totalUsersPromise = user_model_1.User.countDocuments();
    const totalActiveUsersPromise = user_model_1.User.countDocuments({ isActive: true });
    const totalInActiveUsersPromise = user_model_1.User.countDocuments({ isActive: false });
    const totalDeletedUsersPromise = user_model_1.User.countDocuments({ isDeleted: true });
    const newUserInLast7DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });
    const newUserInLast30DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    const userByRolePromise = user_model_1.User.aggregate([
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
    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalDeletedUsers, newUserInLast7Days, newUserInLast30Days, userByRole,] = yield Promise.all([
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
});
const getTransactionStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const totalTransactionsPromise = transaction_model_1.Transaction.countDocuments();
    const totalTopUpPromise = transaction_model_1.Transaction.countDocuments({
        transactionType: transaction_interface_1.TransactionType.TOP_UP,
    });
    const totalCashInPromise = transaction_model_1.Transaction.countDocuments({
        transactionType: transaction_interface_1.TransactionType.CASH_IN,
    });
    const totalCashOutPromise = transaction_model_1.Transaction.countDocuments({
        transactionType: transaction_interface_1.TransactionType.CASH_OUT,
    });
    const totalWithdrawPromise = transaction_model_1.Transaction.countDocuments({
        transactionType: transaction_interface_1.TransactionType.WITHDRAW,
    });
    const totalSendMoneyPromise = transaction_model_1.Transaction.countDocuments({
        transactionType: transaction_interface_1.TransactionType.SEND_MONEY,
    });
    const totalTransactionAmountPromise = transaction_model_1.Transaction.aggregate([
        { $match: { status: transaction_interface_1.Status.SUCCESSFUL } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const mostActiveUsersPromise = transaction_model_1.Transaction.aggregate([
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
    const totalTransactionLast7DaysPromise = transaction_model_1.Transaction.aggregate([
        {
            $match: { createdAt: { $gte: sevenDaysAgo }, status: transaction_interface_1.Status.SUCCESSFUL },
        },
        {
            $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalAmount: { $sum: "$amount" },
            },
        },
    ]);
    const totalTransactionLast30DaysPromise = transaction_model_1.Transaction.aggregate([
        {
            $match: { createdAt: { $gte: thirtyDaysAgo }, status: transaction_interface_1.Status.SUCCESSFUL },
        },
        {
            $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalAmount: { $sum: "$amount" },
            },
        },
    ]);
    const dailyTransactionsPromise = transaction_model_1.Transaction.aggregate([
        {
            $match: {
                createdAt: { $gte: thirtyDaysAgo },
                status: transaction_interface_1.Status.SUCCESSFUL,
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
    const transactionTypeBreakdownPromise = transaction_model_1.Transaction.aggregate([
        {
            $match: { status: transaction_interface_1.Status.SUCCESSFUL },
        },
        {
            $group: {
                _id: "$transactionType",
                totalAmount: { $sum: "$amount" },
                totalTransactions: { $sum: 1 },
            },
        },
    ]);
    const failedTransactionsPromise = transaction_model_1.Transaction.countDocuments({
        status: transaction_interface_1.Status.FAILED,
    });
    const avgTransactionSizePromise = transaction_model_1.Transaction.aggregate([
        { $match: { status: transaction_interface_1.Status.SUCCESSFUL } },
        {
            $group: {
                _id: null,
                averageAmount: { $avg: "$amount" },
            },
        },
    ]);
    const peakTransactionHoursPromise = transaction_model_1.Transaction.aggregate([
        { $match: { status: transaction_interface_1.Status.SUCCESSFUL } },
        {
            $group: {
                _id: { $hour: "$createdAt" },
                totalTransactions: { $sum: 1 },
            },
        },
        { $sort: { totalTransactions: -1 } },
        { $limit: 5 }
    ]);
    const [totalTransactions, totalTopUp, totalCashIn, totalCashOut, totalWithdraw, totalSendMoney, totalTransactionAmount, mostActiveUsers, totalTransactionLast7Days, totalTransactionLast30Days, failedTransactions, avgTransactionSize, peakTransactionHours, dailyTransactions, transactionTypeBreakdown,] = yield Promise.all([
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
        totalTransactedAmount: ((_a = totalTransactionAmount[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0,
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
});
exports.statsService = {
    getUserStats,
    getTransactionStats,
};
