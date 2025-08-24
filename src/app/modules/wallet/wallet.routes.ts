import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { walletController } from "./wallet.controller";

const router = Router();

router.get("/", checkAuth(Role.ADMIN), walletController.getAllWallets);
router.get("/wallet-summary/", checkAuth(...Object.values(Role)), walletController.getWalletSummary);
router.get("/my-wallet", checkAuth(...Object.values(Role)), walletController.myWallet);
router.patch("/block-wallet/:id", checkAuth(Role.ADMIN), walletController.blockWallet);

export const walletRoutes = router;
