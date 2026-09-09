import {
  Router
} from "express";

import {
  getCurrentStudent,
  getCurrentStudentPaymentStatus,
  getCurrentStudentPayments,
  registerFcmToken,
  removeFcmToken
} from "../controllers/studentAuthController.js";

import {
  studentProtect
} from "../middleware/studentAuthMiddleware.js";

const router =
  Router();

router.use(
  studentProtect
);

router.get(
  "/me",
  getCurrentStudent
);

router.get(
  "/payment-status",
  getCurrentStudentPaymentStatus
);

router.get(
  "/payments",
  getCurrentStudentPayments
);

router.post(
  "/fcm-token",
  registerFcmToken
);

router.delete(
  "/fcm-token",
  removeFcmToken
);

export default router;