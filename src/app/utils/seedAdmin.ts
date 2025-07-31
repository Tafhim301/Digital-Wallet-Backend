import bcryptjs from "bcryptjs"
import { User } from "../modules/user/user.model";
import { envVars } from "../config/env";
import { IUser, Role } from "../modules/user/user.interface";

export const seedAdmin = async () => {
    try {
        const Admin = await User.findOne({phone : envVars.ADMIN_PHONE})

        if(Admin) {
            console.log("Admin already exists");
            return;
        }

    const hashedPassword = await bcryptjs.hash(envVars.ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND));
   
    const payload : IUser = {
        name : "Admin",
        role : Role.ADMIN,
        phone : envVars.ADMIN_PHONE,
        password : hashedPassword,
        
       

        
    }
    const createAdmin = await User.create(payload)
    console.log(createAdmin);
        
    } catch (error) {
        console.log(error)
        
    }
}