// Server/routes/plans.js
import express from "express";
import { getPlans, subscribeToPlan, getMySubscription, getAllSubscriptions } from "../controllers/planController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getPlans);
router.post("/subscribe/:planId", authenticate, subscribeToPlan);
router.get("/my-subscription", authenticate, getMySubscription);
// admin
router.get("/admin/subscriptions", authenticate, authorize("admin"), getAllSubscriptions);

export default router;
