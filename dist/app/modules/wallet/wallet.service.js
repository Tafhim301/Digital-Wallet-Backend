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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletServices = exports.getWalletSummary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = __importDefault(require("../../errorHandlers/appError"));
const queryBuilder_1 = require("../../utils/queryBuilder");
const transaction_model_1 = require("../transaction/transaction.model");
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("./wallet.model");
const transaction_interface_1 = require("../transaction/transaction.interface");
const getAllWallets = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(wallet_model_1.Wallet.find(), query);
    const users = yield queryBuilder.filter().fields().sort().paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta(),
    ]);
    return { meta: meta, data: data };
});
const myWallet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).populate("wallet");
    if (!user) {
        throw new appError_1.default(404, "User Not Found");
    }
    return user;
});
const blockWallet = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findById(id);
    if (!wallet) {
        throw new appError_1.default(404, "Wallet Not Found");
    }
    const isWalletBlocked = wallet.isBlocked;
    const updatedWallet = yield wallet_model_1.Wallet.findByIdAndUpdate(id, { isBlocked: !isWalletBlocked }, { new: true });
    return updatedWallet;
});
const getWalletSummary = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = new mongoose_1.default.Types.ObjectId(userId);
    const summary = yield transaction_model_1.Transaction.aggregate([
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
                                    { $eq: ["$transactionType", transaction_interface_1.TransactionType.CASH_IN] },
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
                                    { $eq: ["$transactionType", transaction_interface_1.TransactionType.CASH_OUT] },
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
                                    { $eq: ["$transactionType", transaction_interface_1.TransactionType.SEND_MONEY] },
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
                            {
                                $and: [
                                    { $eq: ["$transactionType", transaction_interface_1.TransactionType.TOP_UP] },
                                    { $eq: ["$sender", uid] },
                                ],
                            },
                            "$amount",
                            0,
                        ],
                    },
                },
                withdrawTotal: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$transactionType", transaction_interface_1.TransactionType.WITHDRAW] },
                                    { $eq: ["$sender", uid] },
                                ],
                            },
                            "$amount",
                            0,
                        ],
                    },
                },
                adminCashInTotal: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$transactionType", transaction_interface_1.TransactionType.ADMIN_CASH_IN] },
                                    { $eq: ["$receiver", uid] },
                                ],
                            },
                            "$amount",
                            0,
                        ],
                    },
                },
            },
        },
    ]);
    // --- Monthly Trends ---
    const rawTrends = yield transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [{ sender: uid }, { receiver: uid }],
            },
        },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                },
                cashIn: {
                    $sum: {
                        $cond: [{ $eq: ["$transactionType", transaction_interface_1.TransactionType.CASH_IN] }, "$amount", 0],
                    },
                },
                cashOut: {
                    $sum: {
                        $cond: [{ $eq: ["$transactionType", transaction_interface_1.TransactionType.CASH_OUT] }, "$amount", 0],
                    },
                },
                adminCashIn: {
                    $sum: {
                        $cond: [{ $eq: ["$transactionType", transaction_interface_1.TransactionType.ADMIN_CASH_IN] }, "$amount", 0],
                    },
                },
            },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);
    // --- Fill Last 6 Months ---
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            name: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
            "Cash In": 0,
            "Cash Out": 0,
            "Admin Cash In": 0,
        };
    });
    const formattedTrends = months
        .map((m) => {
        const found = rawTrends.find((t) => t._id.year === m.year && t._id.month === m.month);
        return found
            ? {
                name: m.name,
                "Cash In": found.cashIn,
                "Cash Out": found.cashOut,
                "Admin Cash In": found.adminCashIn,
            }
            : m;
    })
        .reverse(); // Chronological order
    return {
        summary: summary[0] || {
            cashInTotal: 0,
            cashOutTotal: 0,
            sendMoneyTotal: 0,
            topUpTotal: 0,
            withdrawTotal: 0,
            adminCashInTotal: 0,
        },
        trends: formattedTrends,
    };
});
exports.getWalletSummary = getWalletSummary;
exports.walletServices = {
    getAllWallets,
    blockWallet,
    myWallet,
    getWalletSummary: exports.getWalletSummary,
};
