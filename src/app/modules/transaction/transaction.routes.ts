import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { transactionController } from "./transaction.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTransactionSchema } from "./transaction.validation";

const router = Router()

router.post('/send-money',checkAuth(Role.USER),validateRequest(createTransactionSchema),transactionController.sendMoney)
router.post('/cash-in',checkAuth(Role.AGENT),validateRequest(createTransactionSchema),transactionController.cashIn)
router.post('/cash-out',checkAuth(Role.USER),validateRequest(createTransactionSchema),transactionController.cashout)





export const transactionRoutes = router