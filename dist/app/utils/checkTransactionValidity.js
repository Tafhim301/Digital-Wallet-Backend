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
exports.isWalletBlocked = void 0;
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const wallet_model_1 = require("../modules/wallet/wallet.model");
const isWalletBlocked = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, context = "User") {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, `${context} not found`);
    }
    if (user.isActive === user_interface_1.isActive.BLOCKED) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, `${context}'s account is blocked`);
    }
    if (user.approvalStatus === user_interface_1.ApprovalStatus.SUSPENDED) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, `${context}'s account is suspended`);
    }
    const wallet = yield wallet_model_1.Wallet.findById(user.wallet);
    if (!wallet) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, `${context}'s wallet not found`);
    }
    if (wallet.isBlocked === true) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, `${context}'s wallet is blocked`);
    }
});
exports.isWalletBlocked = isWalletBlocked;
