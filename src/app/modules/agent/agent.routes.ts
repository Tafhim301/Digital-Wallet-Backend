import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { agentController } from "./agent.controller";

const router = Router()

router.post('/agent-application',checkAuth(Role.USER),agentController.agentApplication)
router.get('/',checkAuth(Role.ADMIN))
router.get('/agent-applications',checkAuth(Role.ADMIN),agentController.getAgentApplications)
router.patch('/approve-agent/:id',checkAuth(Role.ADMIN),agentController.approveAgent)








export const agentRoutes = router