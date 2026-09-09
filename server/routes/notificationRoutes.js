import { Router } from "express";

import {
  getNotifications,
  getNotificationStats,
  sendNotification
} from "../controllers/notificationController.js";

import {
  protect
} from "../middleware/authMiddleware.js";

import {
  adminOnly
} from "../middleware/adminMiddleware.js";

const router = Router();

/*
 * Every notification operation is
 * restricted to authenticated admins.
 */
router.use(
  protect,
  adminOnly
);

router.get(
  "/",
  getNotifications
);

router.get(
  "/stats",
  getNotificationStats
);

router.post(
  "/send",
  sendNotification
);

export default router;