import Payment from "../models/Payment.js";
import Student from "../models/Student.js";

export async function getCurrentStudent(
  req,
  res
) {
  try {
    return res.status(200).json({
      success: true,
      student: req.student
    });
  } catch (error) {
    console.error(
      "Get current student error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch student profile"
    });
  }
}

export async function getCurrentStudentPaymentStatus(
  req,
  res
) {
  try {
    const student =
      req.student;

    const now =
      new Date();

    const currentMonth =
      now.getMonth() + 1;

    const currentYear =
      now.getFullYear();

    const payment =
      await Payment.findOne({
        studentId:
          student._id,

        month:
          currentMonth,

        year:
          currentYear,

        status: "paid"
      }).populate(
        "markedBy",
        "name email"
      );

    return res.status(200).json({
      success: true,

      month:
        currentMonth,

      year:
        currentYear,

      monthlyFee:
        student.monthlyFee,

      paymentStatus:
        payment
          ? "paid"
          : "unpaid",

      payment:
        payment || null
    });
  } catch (error) {
    console.error(
      "Get current student payment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch current payment status"
    });
  }
}

export async function getCurrentStudentPayments(
  req,
  res
) {
  try {
    const payments =
      await Payment.find({
        studentId:
          req.student._id,

        status: "paid"
      })
        .populate(
          "markedBy",
          "name email"
        )
        .sort({
          year: -1,
          month: -1,
          paymentDate: -1
        });

    return res.status(200).json({
      success: true,

      count:
        payments.length,

      payments
    });
  } catch (error) {
    console.error(
      "Get current student payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment history"
    });
  }
}

export async function registerFcmToken(
  req,
  res
) {
  try {
    const {
      token
    } = req.body;

    if (
      !token ||
      typeof token !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid FCM token is required"
      });
    }

    const student =
      await Student.findById(
        req.student._id
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found"
      });
    }

    if (
      !student.fcmTokens.includes(
        token
      )
    ) {
      student.fcmTokens.push(token);

      await student.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "Device registered for notifications"
    });
  } catch (error) {
    console.error(
      "Register FCM token error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to register device"
    });
  }
}

export async function removeFcmToken(
  req,
  res
) {
  try {
    const {
      token
    } = req.body;

    if (
      !token ||
      typeof token !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid FCM token is required"
      });
    }

    await Student.findByIdAndUpdate(
      req.student._id,
      {
        $pull: {
          fcmTokens: token
        }
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Device removed from notifications"
    });
  } catch (error) {
    console.error(
      "Remove FCM token error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove device"
    });
  }
}