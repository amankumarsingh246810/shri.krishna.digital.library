import { Router } from "express";

import {
  getPaymentAudits,
  getPaymentAuditByPaymentId,
  getStudentPaymentAudits,
  correctPayment
} from "../controllers/paymentAuditController.js";

import {
  protect
} from "../middleware/authMiddleware.js";

import {
  adminOnly
} from "../middleware/adminMiddleware.js";

const router = Router();

/*
 * Every payment-audit route requires
 * authenticated admin access.
 */
router.use(
  protect,
  adminOnly
);

/*
 * Get all audit records.
 *
 * GET /api/payment-audits
 */
router.get(
  "/",
  getPaymentAudits
);

/*
 * Get audit history for one payment.
 *
 * GET /api/payment-audits/payment/:paymentId
 */
router.get(
  "/payment/:paymentId",
  getPaymentAuditByPaymentId
);

/*
 * Get audit history for one student.
 *
 * GET /api/payment-audits/student/:studentId
 */
router.get(
  "/student/:studentId",
  getStudentPaymentAudits
);

/*
 * Correct an existing payment.
 *
 * POST /api/payment-audits/:paymentId/correct
 */
router.post(
  "/:paymentId/correct",
  correctPayment
);

export default router;