import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import studentAuthRoutes from "./routes/studentAuthRoutes.js";
import paymentAuditRoutes from "./routes/paymentAuditRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

/*
 * CORS
 */
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173"
  })
);

/*
 * JSON body parser
 */
app.use(express.json());

/*
 * Health check
 */
app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Shri Krishna Digital Library API is running"
    });
  }
);

/*
 * Admin authentication
 */
app.use(
  "/api/auth",
  authRoutes
);

/*
 * Admin dashboard
 */
app.use(
  "/api/dashboard",
  dashboardRoutes
);

/*
 * Student management
 */
app.use(
  "/api/students",
  studentRoutes
);

/*
 * Payment management
 */
app.use(
  "/api/payments",
  paymentRoutes
);

/*
 * Payment audit and corrections
 */
app.use(
  "/api/payment-audits",
  paymentAuditRoutes
);

/*
 * Student authentication
 */
app.use(
  "/api/student-auth",
  studentAuthRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

/*
 * 404 handler
 */
app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found"
    });
  }
);

/*
 * Global error handler
 */
app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Internal server error"
    });
  }
);

export default app;