import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

router.get("/admin", protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the protected admin dashboard",
    admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

export default router;