"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const bdPhoneRegex = /^(?:\+880|880|0)1[3-9]\d{8}$/;
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ error: "Name must be string" })
        .min(2, { message: "Name is too short" })
        .max(50, { message: "Name is too long" }),
    phone: zod_1.default.string().regex(bdPhoneRegex, {
        message: "Invalid Bangladeshi phone number format",
    }),
    password: zod_1.default
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
    })
        .refine((val) => /[^a-zA-Z0-9]/.test(val), {
        message: "Password must contain at least one special character",
    })
        .refine((val) => /\d/.test(val), {
        message: "Password must contain at least one number",
    }),
    role: zod_1.default.string().optional()
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ error: "Name must be string" })
        .min(2, { message: "Name is too short" })
        .max(50, { message: "Name is too long" })
        .optional(),
    phone: zod_1.default.string().regex(bdPhoneRegex, {
        message: "Invalid Bangladeshi phone number format",
    }).optional(),
    password: zod_1.default.string().optional()
});
