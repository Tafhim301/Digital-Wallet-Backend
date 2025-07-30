import bcryptjs from "bcryptjs"
import { IUser } from "../modules/user/user.interface"
import httpStatus from 'http-status-codes'
import AppError from "../errorHandlers/appError"

export const validatePassword = async(user : Partial<IUser>, password : string) => {
    const matchedPassword = await bcryptjs.compare(password, user?.password as string)
    if(!matchedPassword){
        throw new AppError(httpStatus.UNAUTHORIZED, "Password doesn't Match")
    }

}