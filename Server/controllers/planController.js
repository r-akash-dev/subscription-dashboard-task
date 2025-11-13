// Server/controllers/planController.js
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";
import mongoose from "mongoose";

/** GET /api/plans - public */
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    return res.json({ plans });
  } catch (err) {
    console.error("getPlans error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




/** POST /api/subscribe/:planId - authenticated user subscribes */
export const subscribeToPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.params;

    if (!mongoose.isValidObjectId(planId)) return res.status(400).json({ message: "Invalid plan id" });

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Compute start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(plan.duration));

    // Optionally: if user already has an active subscription, either extend or replace.
    // Here: mark existing active subscriptions as expired and create a new one.
    await Subscription.updateMany(
      { user: userId, status: "active" },
      { $set: { status: "expired" } }
    );

    const subscription = await Subscription.create({
      user: userId,
      plan: plan._id,
      start_date: startDate,
      end_date: endDate,
      status: "active"
    });

    return res.status(201).json({ subscription });
  } catch (err) {
    console.error("subscribeToPlan error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/my-subscription - returns user's active plan (if any) */
export const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    // find active subscription (and check expiration)
    const sub = await Subscription.findOne({ user: userId, status: "active" }).populate("plan");
    if (!sub) return res.json({ subscription: null });

    // auto-expire if end_date passed
    const now = new Date();
    if (sub.end_date < now) {
      sub.status = "expired";
      await sub.save();
      return res.json({ subscription: null });
    }

    return res.json({ subscription: sub });
  } catch (err) {
    console.error("getMySubscription error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getAllSubscriptions = async (req, res) => {
  try {
    // optional query params: page, limit, status, userEmail
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userEmail) filter["user.email"] = req.query.userEmail; // not used directly; we will filter after populate or via aggregation

    // Use populate to include user and plan data
    const total = await Subscription.countDocuments(filter);
    const subs = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "user", select: "email username" })
      .populate({ path: "plan", select: "name price duration" })
      .lean();

    return res.json({
      subscriptions: subs,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getAllSubscriptions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
