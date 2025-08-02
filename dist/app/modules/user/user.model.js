"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(user_interface_1.Role), default: user_interface_1.Role.USER },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isAgent: { type: Boolean, default: false },
    approvalStatus: {
        type: String,
        enum: user_interface_1.ApprovalStatus,
        default: user_interface_1.ApprovalStatus.UNAPPLIED,
    },
    wallet: { type: mongoose_1.Schema.Types.ObjectId, ref: "Wallet", sparse: true, unique: true },
}, {
    timestamps: true,
    versionKey: false,
});
exports.User = (0, mongoose_1.model)("User", UserSchema);
