import { envVars } from "../../config/env";
import AppError from "../../errorHandlers/appError";
import { Wallet } from "../wallet/wallet.model";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";

const createUser = async (payload: Partial<IUser>) => {
  const { name, phone, password, ...rest } = payload;
  const doesUserExist = await User.findOne({ phone });
  if (doesUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exists");
  }
  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const user = await User.create({
    name: name,
    phone: phone,
    password: hashedPassword,
    rest,
  });

  const wallet = await Wallet.create({
    user: user._id,
  });

  await User.findByIdAndUpdate(user?._id, { wallet: wallet._id });

  return { user, wallet };
};

export const userServices = {
  createUser,
}



