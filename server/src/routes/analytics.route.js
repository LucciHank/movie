import express from "express";
import analyticsController from "../controllers/analytics.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";

const router = express.Router();

// Public route for tracking (can be anonymous or authenticated)
// If authenticated, tokenMiddleware will attach user to req
router.post(
    "/track",
    tokenMiddleware.decodeToken, // Just decode, don't enforce auth
    analyticsController.track
);

// Admin route for stats
router.get(
    "/stats",
    tokenMiddleware.auth, // Enforce auth
    analyticsController.getStats
);

export default router;
