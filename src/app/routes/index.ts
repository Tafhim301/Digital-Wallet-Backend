import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { agentRoutes } from "../modules/agent/agent.routes";

export const router = Router();

const moduleRoutes = [
    {
       path : '/user',
       route : userRoutes
    },
    {
       path : '/auth',
       route : authRoutes
    },
    {
       path : '/agent',
       route : agentRoutes
    },
    
];


moduleRoutes.forEach((route) => {
    router.use(route.path,route.route)
})
