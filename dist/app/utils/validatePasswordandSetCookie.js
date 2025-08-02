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
exports.validatePassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = __importDefault(require("../errorHandlers/appError"));
const user_model_1 = require("../modules/user/user.model");
const userTokens_1 = require("./userTokens");
const validatePassword = (phone, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ phone });
    if (!user) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found please check the phone number and try again or register");
    }
    const matchedPassword = yield bcryptjs_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
    if (!matchedPassword) {
        throw new appError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Password doesn't Match");
    }
    const accessToken = (0, userTokens_1.createUserTokens)(user);
    return {
        user: user,
        accessToken: accessToken,
    };
});
exports.validatePassword = validatePassword;
