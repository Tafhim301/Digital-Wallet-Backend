/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { userServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { setAuthCookie } from "../../utils/setCookies";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userServices.createUser(req.body);
    setAuthCookie(res, result.accessToken);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User created successfully",
      data: result,
    });
  }
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.userId;

    const result = await userServices.getMe(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User retrieved successfully",
      data: result,
    });
  }
);
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.userId;
    const payload = req.body

    const result = await userServices.updateProfile(userId,payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User updated successfully",
      data: result,
    });
  }
);
const checkPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.userId;
    const password = req.body.password;

 

    const result = await userServices.checkPassword(userId, password);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password Validation Completed",
      data: result,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await userServices.getAllUsers(
      query as Record<string, string>
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All user retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const userController = {
  createUser,
  getAllUsers,
  getMe,
  checkPassword,
  updateProfile
};
