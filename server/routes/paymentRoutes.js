import { Router } from "express";

import {
  createPayment,
  getPayments,
  getPaymentById,
  getStudentPayments,
  getMonthlyPaymentStatus
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();


// ======================================================
// All payment routes require admin authentication
// ======================================================

router.use(protect, adminOnly);


// ======================================================
// Create payment
// POST /api/payments
// ======================================================

router.post("/", createPayment);


// ======================================================
// Get all payments
// GET /api/payments
// ======================================================

router.get("/", getPayments);


// ======================================================
// Get monthly payment status
// IMPORTANT: This route must come before /:id
// GET /api/payments/status/:year/:month
// ======================================================

router.get(
  "/status/:year/:month",
  getMonthlyPaymentStatus
);


// ======================================================
// Get payments for a student
// GET /api/payments/student/:studentId
// ======================================================

router.get(
  "/student/:studentId",
  getStudentPayments
);


// ======================================================
// Get payment by ID
// GET /api/payments/:id
// ======================================================

router.get(
  "/:id",
  getPaymentById
);


export default router;