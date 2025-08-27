"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const agent_routes_1 = require("../modules/agent/agent.routes");
const wallet_routes_1 = require("../modules/wallet/wallet.routes");
const transaction_routes_1 = require("../modules/transaction/transaction.routes");
const stats_routes_1 = require("../modules/stats/stats.routes");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/user',
        route: user_routes_1.userRoutes
    },
    {
        path: '/auth',
        route: auth_routes_1.authRoutes
    },
    {
        path: '/agent',
        route: agent_routes_1.agentRoutes
    },
    {
        path: '/wallet',
        route: wallet_routes_1.walletRoutes
    },
    {
        path: '/transaction',
        route: transaction_routes_1.transactionRoutes
    },
    {
        path: '/stats',
        route: stats_routes_1.statsRoutes
    },
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
