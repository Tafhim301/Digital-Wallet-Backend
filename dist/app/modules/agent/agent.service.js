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
exports.agentServices = void 0;
const appError_1 = __importDefault(require("../../errorHandlers/appError"));
const user_interface_1 = require("../user/user.interface");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../user/user.model");
const queryBuilder_1 = require("../../utils/queryBuilder");
const agent_constant_1 = require("./agent.constant");
const transaction_interface_1 = require("../transaction/transaction.interface");
const wallet_model_1 = require("../wallet/wallet.model");
const checkTransactionValidity_1 = require("../../utils/checkTransactionValidity");
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = require("../transaction/transaction.model");
const agentApplication = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = payload;
    if (!phone) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Phone number is required for agent application");
    }
    const user = yield user_model_1.User.findOne({ phone });
    if (!user) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User Does Not Exist. You Must Register As An User To Apply For Agent");
    }
    const agent = yield user_model_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, {
        approvalStatus: user_interface_1.ApprovalStatus.PENDING,
    }, { new: true });
    return {
        approvalStatus: agent === null || agent === void 0 ? void 0 : agent.approvalStatus,
    };
});
const getAgentApplications = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(user_model_1.User.find({ approvalStatus: user_interface_1.ApprovalStatus.PENDING }), query);
    const users = yield queryBuilder
        .search(agent_constant_1.agentSearchableFields)
        .filter()
        .fields()
        .sort()
        .paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta(),
    ]);
    return { meta: meta, data: data };
});
const getAllAgents = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(user_model_1.User.find({ role: user_interface_1.Role.AGENT }), query);
    const users = yield queryBuilder
        .search(agent_constant_1.agentSearchableFields)
        .filter()
        .fields()
        .sort()
        .paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta(),
    ]);
    return { meta: meta, data: data };
});
const approveAgent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const approvedAgent = yield user_model_1.User.findByIdAndUpdate(id, {
        role: user_interface_1.Role.AGENT,
        approvalStatus: user_interface_1.ApprovalStatus.APPROVED,
        isAgent: true,
    }, { new: true });
    return {
        role: approvedAgent === null || approvedAgent === void 0 ? void 0 : approvedAgent.role,
        ApprovalStatus: approvedAgent === null || approvedAgent === void 0 ? void 0 : approvedAgent.approvalStatus,
        isAgent: approvedAgent === null || approvedAgent === void 0 ? void 0 : approvedAgent.isAgent,
    };
});
const suspendAgent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const suspendedAgent = yield user_model_1.User.findByIdAndUpdate(id, {
        role: user_interface_1.Role.USER,
        approvalStatus: user_interface_1.ApprovalStatus.SUSPENDED,
        isAgent: false,
    }, { new: true });
    return {
        role: suspendedAgent === null || suspendedAgent === void 0 ? void 0 : suspendedAgent.role,
        ApprovalStatus: suspendedAgent === null || suspendedAgent === void 0 ? void 0 : suspendedAgent.approvalStatus,
        isAgent: suspendedAgent === null || suspendedAgent === void 0 ? void 0 : suspendedAgent.isAgent,
    };
});
const cashInAgent = (agentId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = payload;
    if (!amount) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount is required");
    }
    if (typeof amount !== "number" || amount <= 0) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Amount must be a positive number");
    }
    const agent = yield user_model_1.User.findById(agentId);
    if (!agent) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    if (agent.role !== user_interface_1.Role.AGENT) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Target user is not an agent");
    }
    yield (0, checkTransactionValidity_1.isWalletBlocked)(agent._id, "Agent");
    const agentWallet = yield wallet_model_1.Wallet.findById(agent.wallet);
    if (!agentWallet) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        agentWallet.balance += amount;
        yield agentWallet.save({ session });
        yield transaction_model_1.Transaction.create([
            {
                sender: "688a43cab99b963182ea5090",
                receiever: agent._id,
                amount: amount,
                transactionType: transaction_interface_1.TransactionType.ADMIN_CASH_IN
            },
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        return { message: "Cash-in to agent successful" };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.agentServices = {
    agentApplication,
    getAgentApplications,
    approveAgent,
    getAllAgents,
    suspendAgent,
    cashInAgent
};
