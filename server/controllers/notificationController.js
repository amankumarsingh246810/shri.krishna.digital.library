import Student from "../models/Student.js";

import {
  sendPushNotification,
  sendPushNotificationToMany
} from "../services/notificationService.js";

export async function getNotifications(req, res) {
  try {
    /*
     * Notification model is intentionally imported
     * dynamically here to keep this controller
     * compatible with the existing notification
     * service/model setup.
     */
    const {
      default: Notification
    } = await import(
      "../models/Notification.js"
    );

    const {
      type,
      status,
      limit = 100
    } = req.query;

    const query = {};

    if (
      type &&
      ["fee_reminder", "announcement"].includes(
        type
      )
    ) {
      query.type = type;
    }

    if (
      status &&
      ["queued", "sent", "failed"].includes(
        status
      )
    ) {
      query.status = status;
    }

    const notifications =
      await Notification.find(query)
        .populate(
          "studentId",
          "name fatherName phoneNumber seatNumber"
        )
        .sort({
          createdAt: -1
        })
        .limit(
          Math.min(
            Number(limit) || 100,
            200
          )
        );

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
        "Failed to fetch notification history"
    });
  }
}

export async function sendManualNotification(
  req,
  res
) {
  try {
    const {
      studentIds,
      title,
      message
    } = req.body;

    /*
     * ------------------------------------------
     * Validate title
     * ------------------------------------------
     */
    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notification title is required"
      });
    }

    /*
     * ------------------------------------------
     * Validate message
     * ------------------------------------------
     */
    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notification message is required"
      });
    }

    const cleanTitle =
      title.trim();

    const cleanMessage =
      message.trim();

    if (
      cleanTitle.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notification title cannot exceed 100 characters"
      });
    }

    if (
      cleanMessage.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Notification message cannot exceed 500 characters"
      });
    }

    /*
     * ------------------------------------------
     * Validate student selection
     * ------------------------------------------
     */
    if (
      !Array.isArray(studentIds)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "studentIds must be an array"
      });
    }

    /*
     * ------------------------------------------
     * Send to all active students
     * ------------------------------------------
     */
    if (
      studentIds.length === 0
    ) {
      const students =
        await Student.find({
          enrollmentStatus:
            "active"
        });

      if (
        students.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No active students are available"
        });
      }

      const results =
        await sendPushNotificationToMany({
          students,

          title:
            cleanTitle,

          message:
            cleanMessage,

          type:
            "announcement"
        });

      const successful =
        results.filter(
          (item) =>
            item.success
        ).length;

      const failed =
        results.length -
        successful;

      return res.status(200).json({
        success:
          successful > 0,

        message:
          successful > 0
            ? `Notification sent successfully to ${successful} student(s).`
            : "Notification could not be delivered to any selected student.",

        totalStudents:
          students.length,

        successful,

        failed,

        results
      });
    }

    /*
     * ------------------------------------------
     * Remove duplicate IDs
     * ------------------------------------------
     */
    const uniqueStudentIds =
      [
        ...new Set(
          studentIds.map(
            (id) =>
              String(id)
          )
        )
      ];

    /*
     * ------------------------------------------
     * Find selected active students
     * ------------------------------------------
     */
    const students =
      await Student.find({
        _id: {
          $in:
            uniqueStudentIds
        },

        enrollmentStatus:
          "active"
      });

    if (
      students.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "No active students were found for the selected IDs"
      });
    }

    /*
     * ------------------------------------------
     * Send notifications
     * ------------------------------------------
     */
    const results =
      await sendPushNotificationToMany({
        students,

        title:
          cleanTitle,

        message:
          cleanMessage,

        type:
          "announcement"
      });

    const successful =
      results.filter(
        (item) =>
          item.success
      ).length;

    const failed =
      results.length -
      successful;

    return res.status(200).json({
      success:
        successful > 0,

      message:
        successful > 0
          ? `Notification sent successfully to ${successful} student(s).`
          : "Notification could not be delivered to the selected students.",

      totalStudents:
        students.length,

      successful,

      failed,

      results
    });
  } catch (error) {
    console.error(
      "Send manual notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send notification"
    });
  }
}