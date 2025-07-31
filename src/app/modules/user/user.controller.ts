/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { userServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const result = await userServices.createUser(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User created successfully",
      data: result
      
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
    getAllUsers
}