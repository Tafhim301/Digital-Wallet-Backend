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
exports.transactionServices = exports.withdrawFromATM = exports.topUp = void 0;
const appError_1 = __importDefault(require("../../errorHandlers/appError"));
const user_model_1 = require("../user/user.model");
const transaction_interface_1 = require("./transaction.interface");
const transaction_model_1 = require("./transaction.model");
const wallet_model_1 = require("../wallet/wallet.model");
const checkTransactionValidity_1 = require("../../utils/checkTransactionValidity");
const user_interface_1 = require("../user/user.interface");
const queryBuilder_1 = require("../../utils/queryBuilder");
const sendMoney = (userToken, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const senderId = userToken.userId;
    const user = yield user_model_1.User.findById(senderId);
    yield (0, checkTransactionValidity_1.isWalletBlocked)(senderId, "Sender");
    if (!user)
        throw new appError_1.default(404, "User not found");
    const userWallet = yield wallet_model_1.Wallet.findById(user.wallet);
    if (!userWallet)
        throw new appError_1.default(404, "Sender's wallet not found");
    const { receiver, amount } = payload;
    if (!receiver || !amount) {
        throw new appError_1.default(400, "receiver and amount are required");
    }
    if (userWallet.balance < amount) {
        throw new appError_1.default(400, "Insufficient balance");
    }
    const agent = yield user_model_1.User.findOne({ phone: receiver });
    yield (0, checkTransactionValidity_1.isWalletBlocked)(agent === null || agent === void 0 ? void 0 : agent.id, "receiver");
    if (!agent) {
        throw new appError_1.default(404, "receiver not found. Amount has not been deducted.");
    }
    if (agent.role === user_interface_1.Role.AGENT) {
        throw new appError_1.default(400, "You can't send money to an agent.Use Cash Out instead.");
    }
    const receiverWallet = yield wallet_model_1.Wallet.findById(agent.wallet);
    if (!receiverWallet) {
        throw new appError_1.default(404, "receiver's wallet not found");
    }
    userWallet.balance -= amount;
    receiverWallet.balance += amount;
    yield userWallet.save();
    yield receiverWallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: senderId,
        receiver: agent._id,
        amount,
        transactionType: transaction_interface_1.TransactionType.SEND_MONEY,
        status: transaction_interface_1.Status.SUCCESSFUL,
    });
    return transaction;
});
const cashIn = (userToken, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiver, amount } = payload;
    if (!receiver || !amount) {
        throw new appError_1.default(400, "receiver and amount are required");
    }
    const agentId = userToken.userId;
    const agent = yield user_model_1.User.findById(agentId);
    if (!agent)
        throw new appError_1.default(404, "Agent not found");
    if (agent.role !== user_interface_1.Role.AGENT) {
        throw new appError_1.default(403, "Only agents can perform cash-in");
    }
    yield (0, checkTransactionValidity_1.isWalletBlocked)(agentId, "sender");
    const agentWallet = yield wallet_model_1.Wallet.findById(agent.wallet);
    if (!agentWallet)
        throw new appError_1.default(404, "Agent's wallet not found");
    if (agentWallet.balance < amount) {
        throw new appError_1.default(400, "Insufficient balance");
    }
    const receiverUser = yield user_model_1.User.findOne({ phone: receiver });
    if (!receiverUser) {
        throw new appError_1.default(404, "receiver not found. Amount has not been deducted.");
    }
    yield (0, checkTransactionValidity_1.isWalletBlocked)(receiverUser.id, "receiver");
    if (receiverUser.role === user_interface_1.Role.AGENT) {
        throw new appError_1.default(400, "You can't cash-in to another agent.");
    }
    const receiverWallet = yield wallet_model_1.Wallet.findById(receiverUser.wallet);
    if (!receiverWallet) {
        throw new appError_1.default(404, "receiver's wallet not found");
    }
    agentWallet.balance -= amount;
    receiverWallet.balance += amount;
    yield agentWallet.save();
    yield receiverWallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: agentId,
        receiver: receiver._id,
        amount,
        transactionType: transaction_interface_1.TransactionType.CASH_IN,
        status: transaction_interface_1.Status.SUCCESSFUL,
    });
    return transaction;
});
const cashOut = (userToken, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiver, amount } = payload;
    if (!receiver || !amount) {
        throw new appError_1.default(400, "receiver and amount are required");
    }
    const senderId = userToken.userId;
    const sender = yield user_model_1.User.findById(senderId);
    if (!sender)
        throw new appError_1.default(404, "User not found");
    yield (0, checkTransactionValidity_1.isWalletBlocked)(senderId, "sender");
    const userWallet = yield wallet_model_1.Wallet.findById(sender.wallet);
    if (!userWallet)
        throw new appError_1.default(404, "sender's wallet not found");
    if (userWallet.balance < amount) {
        throw new appError_1.default(400, "Insufficient balance");
    }
    const agent = yield user_model_1.User.findOne({ phone: receiver });
    yield (0, checkTransactionValidity_1.isWalletBlocked)(agent === null || agent === void 0 ? void 0 : agent.id, "receiver");
    if (!agent) {
        throw new appError_1.default(404, "receiver not found. Amount has not been deducted.");
    }
    if (agent.role === user_interface_1.Role.USER) {
        throw new appError_1.default(400, "You can't cash-out from a user.Use send money instead");
    }
    const receiverWallet = yield wallet_model_1.Wallet.findById(agent.wallet);
    if (!receiverWallet) {
        throw new appError_1.default(404, "receiver's wallet not found");
    }
    userWallet.balance -= amount;
    receiverWallet.balance += amount;
    yield userWallet.save();
    yield receiverWallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: senderId,
        receiver: agent._id,
        amount,
        transactionType: transaction_interface_1.TransactionType.CASH_OUT,
        status: transaction_interface_1.Status.SUCCESSFUL,
    });
    return transaction;
});
const getAllTransactions = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(transaction_model_1.Transaction.find(), query);
    const users = yield queryBuilder.filter().fields().sort().paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta(),
    ]);
    return { meta: meta, data: data };
});
const getOwnTransactionHistory = (userToken, query) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = userToken.userId;
    const baseFilter = {
        $or: [{ sender: userId }, { receiver: userId }],
    };
    const queryBuilder = new queryBuilder_1.QueryBuilder(transaction_model_1.Transaction.find(baseFilter), query);
    const transactionsQuery = queryBuilder.filter().sort().fields().paginate();
    const [transactions, meta] = yield Promise.all([
        transactionsQuery.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        meta,
        data: transactions,
    };
});
const topUp = (userToken, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = payload;
    if (!amount || amount <= 0) {
        throw new appError_1.default(400, "Valid top-up amount is required.");
    }
    const userId = userToken.userId;
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new appError_1.default(404, "User not found.");
    const userWallet = yield wallet_model_1.Wallet.findById(user.wallet);
    if (!userWallet)
        throw new appError_1.default(404, "Wallet not found.");
    userWallet.balance += amount;
    yield userWallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: userId,
        receiver: userId,
        amount,
        transactionType: transaction_interface_1.TransactionType.TOP_UP,
        status: transaction_interface_1.Status.SUCCESSFUL,
    });
    return transaction;
});
exports.topUp = topUp;
const withdrawFromATM = (userToken, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = payload;
    if (!amount || amount <= 0) {
        throw new appError_1.default(400, "Amount must be greater than zero");
    }
    const userId = userToken.userId;
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new appError_1.default(404, "User not found");
    const wallet = yield wallet_model_1.Wallet.findById(user.wallet);
    if (!wallet)
        throw new appError_1.default(404, "Wallet not found");
    if (wallet.balance < amount) {
        yield transaction_model_1.Transaction.create({
            sender: user._id,
            receiver: null,
            amount,
            transactionType: transaction_interface_1.TransactionType.WITHDRAW,
            status: transaction_interface_1.Status.FAILED,
            failure_reason: "Insufficient balance",
        });
        throw new appError_1.default(400, "Insufficient balance");
    }
    wallet.balance -= amount;
    yield wallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: user._id,
        receiver: null,
        amount,
        transactionType: transaction_interface_1.TransactionType.WITHDRAW,
        status: transaction_interface_1.Status.SUCCESSFUL,
    });
    return {
        transaction,
    };
});
exports.withdrawFromATM = withdrawFromATM;
exports.transactionServices = {
    sendMoney,
    cashIn,
    cashOut,
    getAllTransactions,
    getOwnTransactionHistory,
    topUp: exports.topUp,
    withdrawFromATM: exports.withdrawFromATM,
};
