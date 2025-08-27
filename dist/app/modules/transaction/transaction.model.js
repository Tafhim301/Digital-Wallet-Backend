"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transaction_interface_1 = require("./transaction.interface");
const transactionSchema = new mongoose_1.Schema({
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    amount: {
        type: Number,
        min: [1, "Amount must be getter  than 0"],
        required: true,
    },
    transactionType: { type: String, enum: transaction_interface_1.TransactionType, required: true },
    status: {
        type: String,
        enum: transaction_interface_1.Status,
        default: transaction_interface_1.Status.PENDING,
        required: true,
    },
    failure_reason: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Transaction = (0, mongoose_1.model)("Transaction", transactionSchema);
