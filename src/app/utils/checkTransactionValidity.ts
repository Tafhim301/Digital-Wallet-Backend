import AppError from "../errorHandlers/appError";
import { ApprovalStatus, isActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { Wallet } from "../modules/wallet/wallet.model";


export const isWalletBlocked = async (userId: string, context = "User") => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, `${context} not found`);
  }

  if (user.isActive === isActive.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `${context}'s account is blocked`
    );
  }

  if (user.approvalStatus === ApprovalStatus.SUSPENDED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `${context}'s account is suspended`
    );
  }

  const wallet = await Wallet.findById(user.wallet);
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, `${context}'s wallet not found`);
  }

  if (wallet.isBlocked === true) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `${context}'s wallet is blocked`
    );
  }
};
