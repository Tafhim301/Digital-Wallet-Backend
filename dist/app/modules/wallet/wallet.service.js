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
exports.walletServices = void 0;
const appError_1 = __importDefault(require("../../errorHandlers/appError"));
const queryBuilder_1 = require("../../utils/queryBuilder");
const wallet_model_1 = require("./wallet.model");
const getAllWallets = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(wallet_model_1.Wallet.find(), query);
    const users = yield queryBuilder.filter().fields().sort().paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta(),
    ]);
    return { meta: meta, data: data };
});
const blockWallet = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findById(id);
    if (!wallet) {
        throw new appError_1.default(404, "Wallet Not Found");
    }
    const updatedWallet = yield wallet_model_1.Wallet.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
    return updatedWallet;
});
exports.walletServices = {
    getAllWallets,
    blockWallet
};
