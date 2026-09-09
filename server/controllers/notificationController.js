import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";

import {
  sendNotificationToStudents
} from "../services/notificationService.js";

const NOTIFICATION_TYPES = [
  "fee_reminder",
  "announcement"
];

const AUDIENCES = [
  "all_active",
  "unpaid",
  "selected"
];

function getCurrentMonthYear() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/*
 * GET /api/notifications
 */
export async function getNotifications(
  req,
  res
) {
  try {
    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 50,
        1
      ),
      100
    );

    const notifications =
      await Notification.find()
        .populate(
          "studentId",
          "name phoneNumber seatNumber"
        )
        .sort({
          createdAt: -1
        })
        .limit(limit);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications"
    });
  }
}

/*
 * GET /api/notifications/stats
 */
export async function getNotificationStats(
  req,
  res
) {
  try {
    const [
      total,
      sent,
      failed,
      queued
    ] = await Promise.all([
      Notification.countDocuments(),

      Notification.countDocuments({
        status: "sent"
      }),

      Notification.countDocuments({
        status: "failed"
      }),

      Notification.countDocuments({
        status: "queued"
      })
    ]);

    return res.status(200).json({
      success: true,

      stats: {
        total,
        sent,
        failed,
        queued
      }
    });
  } catch (error) {
    console.error(
      "Get notification stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch notification statistics"
    });
  }
}

/*
 * POST /api/notifications/send
 */
export async function sendNotification(
  req,
  res
) {
  try {
    const {
      audience = "all_active",
      type = "announcement",
      studentIds = [],
      title,
      message,
      month,
      year
    } = req.body;

    if (!AUDIENCES.includes(audience)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification audience"
      });
    }

    if (
      !NOTIFICATION_TYPES.includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification type"
      });
    }

    const cleanTitle =
      normalizeText(title);

    const cleanMessage =
      normalizeText(message);

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message:
          "Notification title is required"
      });
    }

    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        message:
          "Notification message is required"
      });
    }

    if (cleanTitle.length > 80) {
      return res.status(400).json({
        success: false,
        message:
          "Notification title cannot exceed 80 characters"
      });
    }

    if (cleanMessage.length > 500) {
      return res.status(400).json({
        success: false,
        message:
          "Notification message cannot exceed 500 characters"
      });
    }

    let targetMonth = month;
    let targetYear = year;

    /*
     * Fee reminders need a month/year.
     */
    if (
      type === "fee_reminder" ||
      audience === "unpaid"
    ) {
      if (
        targetMonth === undefined ||
        targetYear === undefined
      ) {
        const current =
          getCurrentMonthYear();

        targetMonth = current.month;
        targetYear = current.year;
      }

      targetMonth = Number(
        targetMonth
      );

      targetYear = Number(
        targetYear
      );

      if (
        !Number.isInteger(
          targetMonth
        ) ||
        targetMonth < 1 ||
        targetMonth > 12
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Month must be between 1 and 12"
        });
      }

      if (
        !Number.isInteger(
          targetYear
        ) ||
        targetYear < 2000 ||
        targetYear > 2100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid year"
        });
      }
    } else {
      targetMonth = undefined;
      targetYear = undefined;
    }

    let students = [];

    /*
     * ----------------------------------------
     * ALL ACTIVE STUDENTS
     * ----------------------------------------
     */
    if (
      audience === "all_active"
    ) {
      students =
        await Student.find({
          enrollmentStatus:
            "active"
        }).select(
          "name phoneNumber seatNumber enrollmentStatus fcmTokens"
        );
    }

    /*
     * ----------------------------------------
     * SELECTED STUDENTS
     * ----------------------------------------
     */
    if (
      audience === "selected"
    ) {
      if (
        !Array.isArray(studentIds) ||
        studentIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Select at least one student"
        });
      }

      const validStudentIds =
        studentIds.filter(
          (id) =>
            mongoose.isValidObjectId(
              id
            )
        );

      if (
        validStudentIds.length !==
        studentIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected student IDs are invalid"
        });
      }

      students =
        await Student.find({
          _id: {
            $in: validStudentIds
          },

          enrollmentStatus:
            "active"
        }).select(
          "name phoneNumber seatNumber enrollmentStatus fcmTokens"
        );

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No active students were found"
        });
      }
    }

    /*
     * ----------------------------------------
     * UNPAID STUDENTS
     * ----------------------------------------
     */
    if (
      audience === "unpaid"
    ) {
      const activeStudents =
        await Student.find({
          enrollmentStatus:
            "active"
        }).select(
          "name phoneNumber seatNumber enrollmentStatus fcmTokens"
        );

      const paidPayments =
        await Payment.find({
          month: targetMonth,
          year: targetYear,
          status: "paid",

          studentId: {
            $in: activeStudents.map(
              (student) =>
                student._id
            )
          }
        }).select(
          "studentId"
        );

      const paidStudentIds =
        new Set(
          paidPayments.map(
            (payment) =>
              payment.studentId.toString()
          )
        );

      students =
        activeStudents.filter(
          (student) =>
            !paidStudentIds.has(
              student._id.toString()
            )
        );
    }

    if (students.length === 0) {
      return res.status(400).json({
        success: false,

        message:
          audience === "unpaid"
            ? "No unpaid active students found for the selected month"
            : "No students are available for this notification"
      });
    }

    /*
     * ----------------------------------------
     * SEND
     * ----------------------------------------
     */
    const results =
      await sendNotificationToStudents({
        students,
        type,
        title: cleanTitle,
        message: cleanMessage,
        month: targetMonth,
        year: targetYear
      });

    const successfulStudents =
      results.filter(
        (result) =>
          result.success
      ).length;

    const failedStudents =
      results.length -
      successfulStudents;

    return res.status(200).json({
      success: true,

      message:
        successfulStudents > 0
          ? "Notification sending completed"
          : "Notification could not be delivered to any selected student",

      summary: {
        targeted: students.length,
        successful:
          successfulStudents,
        failed:
          failedStudents
      },

      results
    });
  } catch (error) {
    console.error(
      "Send notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send notification"
    });
  }
}