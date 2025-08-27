"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const tenDays = 10 * 24 * 60 * 60 * 1000;
const setAuthCookie = (res, tokenInfo) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            expires: new Date(Date.now() + tenDays)
        });
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            expires: new Date(Date.now() + tenDays * 3)
        });
    }
};
exports.setAuthCookie = setAuthCookie;
