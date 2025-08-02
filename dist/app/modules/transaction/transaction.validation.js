"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const bdPhoneRegex = /^(?:\+880|880|0)1[3-9]\d{8}$/;
exports.createTransactionSchema = zod_1.default.object({
    receiever: zod_1.default.string().regex(bdPhoneRegex, {
        message: "Invalid Bangladeshi phone number format",
    }),
    amount: zod_1.default.number().min(1, "Amount must be greater than 0"),
});
