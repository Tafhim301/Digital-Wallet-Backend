/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { walletServices } from "./wallet.service";

const getAllWallets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await walletServices.getAllWallets(
      query as Record<string, string>
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Wallets retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);
const blockWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await walletServices.blockWallet(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Wallets retrieved successfully",
      data: result,
    });
  }
);

export const walletController = {
  getAllWallets,
  blockWallet,
};
