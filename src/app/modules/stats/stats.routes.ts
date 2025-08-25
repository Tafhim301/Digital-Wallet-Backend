import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { statsController } from "./stats.controller";

const router = Router();

router.get('/user-stats',checkAuth(Role.ADMIN),statsController.getUserStats);
router.get('/transaction-stats',checkAuth(Role.ADMIN),statsController.getTransactionStats);






export const statsRoutes = router