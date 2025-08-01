import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { agentController } from "./agent.controller";

const router = Router();

router.post(
  "/agent-application",
  checkAuth(Role.USER),
  agentController.agentApplication
);
router.get("/all-agents", checkAuth(Role.ADMIN), agentController.getAllAgents);
router.get(
  "/agent-applications",
  checkAuth(Role.ADMIN),
  agentController.getAgentApplications
);
router.patch(
  "/approve-agent/:id",
  checkAuth(Role.ADMIN),
  agentController.approveAgent
);
router.patch(
  "/suspend-agent/:id",
  checkAuth(Role.ADMIN),
  agentController.suspendAgent
);
router.post(
  "/cash-in-agent/:id",
  checkAuth(Role.ADMIN),
  agentController.CashInAgent
);

export const agentRoutes = router;
