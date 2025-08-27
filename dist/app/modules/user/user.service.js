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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../../config/env");
const appError_1 = __importDefault(require("../../errorHandlers/appError"));
const queryBuilder_1 = require("../../utils/queryBuilder");
const wallet_model_1 = require("../wallet/wallet.model");
const user_constant_1 = require("./user.constant");
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const userTokens_1 = require("../../utils/userTokens");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, password, role } = payload, rest = __rest(payload, ["name", "phone", "password", "role"]);
    let { approvalStatus } = payload;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const doesUserExist = yield user_model_1.User.findOne({ phone }).session(session);
        if (doesUserExist) {
            throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User already exists");
        }
        if (role === user_interface_1.Role.AGENT) {
            approvalStatus = user_interface_1.ApprovalStatus.APPROVED;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
        const user = yield user_model_1.User.create([
            Object.assign({ name,
                phone, password: hashedPassword, approvalStatus: approvalStatus, role: role }, rest),
        ], { session });
        const wallet = yield wallet_model_1.Wallet.create([
            {
                user: user[0]._id,
            },
        ], { session });
        user[0].wallet = wallet[0]._id;
        yield user[0].save({ session });
        yield session.commitTransaction();
        session.endSession();
        const accessToken = (0, userTokens_1.createUserTokens)(user[0]);
        return { user: user[0], wallet: wallet[0], accessToken: accessToken };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(user_model_1.User.find({ role: user_interface_1.Role.USER }).populate("wallet"), query);
    const users = yield queryBuilder
        .search(user_constant_1.userSearchableFields)
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
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).populate("wallet");
    if (!user) {
        throw new appError_1.default(404, "User Not Found");
    }
    return user;
});
const updateProfile = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new appError_1.default(404, "User Not Found");
    }
    if (payload.password) {
        const hashedPassword = yield bcryptjs_1.default.hash(payload.password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
        payload.password = hashedPassword;
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });
    return updatedUser;
});
const checkPassword = (userId, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new appError_1.default(404, "User Not Found");
    }
    const matchedPassword = yield bcryptjs_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
    if (!matchedPassword) {
        throw new appError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Password doesn't Match");
    }
    return user;
});
exports.userServices = {
    createUser,
    getAllUsers,
    getMe,
    checkPassword,
    updateProfile,
};
