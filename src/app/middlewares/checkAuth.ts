import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import AppError from "../errorHandlers/appError";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { isActive } from "../modules/user/user.interface";



export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;
      if (!accessToken) {
        throw new AppError(403, "No Token Recieved");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const doesUserExist = await User.findOne({
        phone: verifiedToken.phone,
      });
      if (!doesUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist");
      }
      if (
        doesUserExist.isActive === isActive.BLOCKED ||
        doesUserExist.isActive === isActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${doesUserExist.isActive}`
        );
      }
      if (doesUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
