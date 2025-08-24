import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { transactionController } from "./transaction.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTransactionSchema } from "./transaction.validation";

const router = Router();

router.post(
  "/send-money",
  checkAuth(Role.USER),
  validateRequest(createTransactionSchema),
  transactionController.sendMoney
);
router.post(
  "/cash-out-by-agent",
  checkAuth(Role.AGENT),
  transactionController.cashOutByAgent
);
router.post(
  "/cash-in",
  checkAuth(Role.AGENT),
  validateRequest(createTransactionSchema),
  transactionController.cashIn
);
router.post(
  "/cash-out",
  checkAuth(Role.USER),
  validateRequest(createTransactionSchema),
  transactionController.cashout
);
router.post(
  "/top-up",
  checkAuth(Role.USER),
  transactionController.topUp
);
router.post(
  "/withdraw-money",
  checkAuth(Role.USER),
  transactionController.withdrawFromATM
);
router.get(
  "/all-transactions",
  checkAuth(Role.ADMIN),
  transactionController.getAllTransactions
);
router.get(
  "/own-transactions",
  checkAuth(Role.AGENT, Role.USER),
  transactionController.getOwnTransactionHistory
);

export const transactionRoutes = router;
