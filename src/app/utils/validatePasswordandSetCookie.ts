import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../errorHandlers/appError";
import { User } from "../modules/user/user.model";
import { createUserTokens } from "./userTokens";
import { IUser } from "../modules/user/user.interface";

interface IResult {
  user: IUser;
 accessToken: {
    accessToken: string;
    refreshToken: string;
}
}

export const validatePassword = async (
  phone: string,
  password: string
): Promise<IResult> => {
  const user = await User.findOne({ phone });
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found please check the phone number and try again or register"
    );
  }
  const matchedPassword = await bcryptjs.compare(
    password,
    user?.password as string
  );
  if (!matchedPassword) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password doesn't Match");
  }

  const accessToken = createUserTokens(user);

  return {
    user: user,
    accessToken: accessToken,
  };
};
