/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { authServices } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { setAuthCookie } from "../../utils/setCookies";

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const result = await authServices.login(req.body);

    setAuthCookie(res,result.token)
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: result.user
      
    });
  }
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged out successfully",
      data: null,
    });
  }
);


export const authController = {
    login,
    logout
}
