import { envVars } from "../../config/env";
import AppError from "../../errorHandlers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Wallet } from "../wallet/wallet.model";
import { userSearchableFields } from "./user.constant";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";

const createUser = async (payload: Partial<IUser>) => {
  const { name, phone, password, ...rest } = payload;

  const doesUserExist = await User.findOne({ phone });
  if (doesUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  
  const user = await User.create({
    name,
    phone,
    password: hashedPassword,
    ...rest, 
  });

  const wallet = await Wallet.create({
    user: user._id,
  });

  user.wallet = wallet._id;
  await user.save(); 

  return { user, wallet };
};



const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .fields()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return { meta: meta, data: data };
};

export const userServices = {
  createUser,
  getAllUsers
}



