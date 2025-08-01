/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { transactionServices } from "./transaction.service";
import httpStatus from "http-status-codes";

const sendMoney = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userToken = req.user
    const result = await transactionServices.sendMoney(userToken,req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Money has been sent successfully",
      data: result
      
    });
  }
);
const cashIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userToken = req.user
    const result = await transactionServices.cashIn(userToken,req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Cash-In successfull",
      data: result
      
    });
  }
);
const cashout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userToken = req.user
    const result = await transactionServices.cashOut(userToken,req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Cash-out successfull",
      data: result
      
    });
  }
);
const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    const result = await transactionServices.getAllTransactions(query as Record<string,string>);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All transaction retrieved successfull",
      data: result
      
    });
  }
);


export const transactionController = {
    sendMoney,
    cashIn,
    cashout,
    getAllUser
}