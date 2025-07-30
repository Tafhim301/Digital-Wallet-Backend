import { JwtPayload } from "jsonwebtoken";
import { isActive, IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import { envVars } from "../config/env";
import AppError from "../errorHandlers/appError";
import httpStatus from "http-status-codes";
import { User } from "../modules/user/user.model";


export const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );
  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
  };
};


export const createNewAccessTokenWithRefreshToken = async (refreshToken : string) => {

    const verifiedRefreshToken = await verifyToken(
        refreshToken,
        envVars.JWT_REFRESH_SECRET
      ) as JwtPayload;
    
      const doesUserExist = await User.findOne({
        phone: verifiedRefreshToken.phone,
      });
      if (!doesUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist");
      }
      if (doesUserExist.isActive === isActive.BLOCKED || doesUserExist.isActive === isActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${doesUserExist.isActive}`);
      }
      if (doesUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }
    
      const jwtPayload = {
        userId : doesUserExist._id,
        phone : doesUserExist.phone,
    
      }
    
    
    
    
      const userTokens = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);
    
      return {
        accessToken: userTokens,
       
      
      };

}
