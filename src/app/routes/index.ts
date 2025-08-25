import { Router } from "express";
import { userRoutes } from "../modules/user/user.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { agentRoutes } from "../modules/agent/agent.routes";
import { walletRoutes } from "../modules/wallet/wallet.routes";
import { transactionRoutes } from "../modules/transaction/transaction.routes";
import { statsRoutes } from "../modules/stats/stats.routes";

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
    {
       path : '/wallet',
       route : walletRoutes
    },
    
    {
       path : '/transaction',
       route : transactionRoutes
    },
    {
       path : '/stats',
       route : statsRoutes
    },
    
];


moduleRoutes.forEach((route) => {
    router.use(route.path,route.route)
})
