import { firebaseAdminAuth } from "../config/firebaseAdmin.js";
import Student from "../models/Student.js";

export async function studentProtect(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Student authentication required"
      });
    }

    const idToken =
      authHeader.substring("Bearer ".length);

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Firebase ID token is missing"
      });
    }

    const decodedToken =
      await firebaseAdminAuth.verifyIdToken(
        idToken
      );

    const firebaseUid = decodedToken.uid;
    const phoneNumber =
      decodedToken.phone_number;

    if (!phoneNumber) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated Firebase account does not have a phone number"
      });
    }

    const student = await Student.findOne({
      phoneNumber
    }).select("-fcmTokens");

    if (!student) {
      return res.status(403).json({
        success: false,
        message:
          "No student account is registered with this mobile number"
      });
    }

    if (
      student.enrollmentStatus ===
      "inactive"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your library membership is currently inactive"
      });
    }

    req.student = student;

    req.firebaseUser = {
      uid: firebaseUid,
      phoneNumber
    };

    next();
  } catch (error) {
    console.error(
      "Student authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired student authentication token"
    });
  }
}