import {
  Router
} from "express";

import {
  getNotifications,
  sendManualNotification
} from "../controllers/notificationController.js";

import {
  protect
} from "../middleware/authMiddleware.js";

import {
  adminOnly
} from "../middleware/adminMiddleware.js";

const router =
  Router();

/*
 * All notification management
 * endpoints require admin authentication.
 */
router.use(
  protect,
  adminOnly
);

/*
 * GET /api/notifications
 *
 * Get notification history.
 */
router.get(
  "/",
  getNotifications
);

/*
 * POST /api/notifications/send
 *
 * Send manual notification.
 */
router.post(
  "/send",
  sendManualNotification
);

export default router;