import AppError from "../../errorHandlers/appError"
import { validatePassword } from "../../utils/validatePasswordandSetCookie"
import { IUser } from "../user/user.interface"
import httpStatus from "http-status-codes"

const login = async(payload : Partial<IUser>) => {
    const {phone, password} = payload
    if(!phone || !password){
        throw new AppError(httpStatus.BAD_REQUEST,"Password and Phone Number both are required for login")
    }
    const result = await validatePassword(phone,password)

    

    return  {
     user : result.user,
     token : result.accessToken


    }
    
}


export const authServices = {
    login
}