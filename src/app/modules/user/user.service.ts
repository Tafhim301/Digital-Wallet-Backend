import mongoose from "mongoose";
import { envVars } from "../../config/env";
import AppError from "../../errorHandlers/appError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { Wallet } from "../wallet/wallet.model";
import { userSearchableFields } from "./user.constant";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { createUserTokens } from "../../utils/userTokens";

const createUser = async (payload: Partial<IUser>) => {
  const { name, phone, password, ...rest } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const doesUserExist = await User.findOne({ phone }).session(session);
    if (doesUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
    }


    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

 
    const user = await User.create(
      [
        {
          name,
          phone,
          password: hashedPassword,
          ...rest,
        },
      ],
      { session }
    );

  
    const wallet = await Wallet.create(
      [
        {
          user: user[0]._id,
        },
      ],
      { session }
    );

    user[0].wallet = wallet[0]._id;
    await user[0].save({ session });

    await session.commitTransaction();
    session.endSession();

     const accessToken = createUserTokens(user[0]);

    return { user: user[0], wallet: wallet[0] , accessToken : accessToken};
  } catch (error) {
  
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find({ role: Role.USER }), query);

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
const getMe = async (userId : string) => {

  const user = await User.findById(userId);
  if(!user){
    throw new AppError(404,"User Not Found");
  };

  return user



   
 
};

export const userServices = {
  createUser,
  getAllUsers,
  getMe
};
