import { Router } from "express";

import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  updateEnrollmentStatus
} from "../controllers/studentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = Router();

// All student management routes require admin authentication
router.use(protect, adminOnly);

router.post("/", createStudent);

router.get("/", getStudents);

router.get("/:id", getStudentById);

router.put("/:id", updateStudent);

router.patch("/:id/enrollment", updateEnrollmentStatus);

export default router;