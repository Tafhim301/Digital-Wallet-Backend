import { Response } from "express";
const tenDays = 10 * 24 * 60 * 60 * 1000


export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires :  new Date(Date.now() + tenDays)
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires :  new Date(Date.now() + tenDays * 3)
    });
  }
};
