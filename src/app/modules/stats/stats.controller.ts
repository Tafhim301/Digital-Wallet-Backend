/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";


import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { statsService } from "./stats.service";

const getUserStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const result = await statsService.getUserStats();

    
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User stats retrieved successfully",
      data: result
      
    });
  }
);
const getTransactionStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const result = await statsService.getTransactionStats();

    
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Transaction stats retrieved successfully",
      data: result
      
    });
  }
);





export const statsController = {
    getUserStats,
    getTransactionStats

}