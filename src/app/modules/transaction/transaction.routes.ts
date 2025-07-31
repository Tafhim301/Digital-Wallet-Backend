import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { transactionController } from "./transaction.controller";

const router = Router()

router.post('/send-money',checkAuth(Role.USER),transactionController.sendMoney)




export const transactionRoutes = router