import {
  getMessaging
} from "firebase-admin/messaging";

import Notification from "../models/Notification.js";
import Student from "../models/Student.js";

export async function sendPushNotification({
  studentId,
  title,
  message,
  type = "announcement",
  month,
  year
}) {
  const student =
    await Student.findById(
      studentId
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  const tokens =
    Array.isArray(
      student.fcmTokens
    )
      ? student.fcmTokens.filter(
          Boolean
        )
      : [];

  const notification =
    await Notification.create({
      studentId:
        student._id,

      type,

      month,

      year,

      channel: "push",

      title,

      message,

      status: "queued"
    });

  if (tokens.length === 0) {
    notification.status =
      "failed";

    notification.error =
      "Student has no registered notification device.";

    await notification.save();

    return {
      success: false,
      notification,
      sentCount: 0,
      failedCount: 0
    };
  }

  try {
    const response =
      await getMessaging().sendEachForMulticast(
        {
          tokens,

          notification: {
            title,
            body: message
          },

          data: {
            type,
            studentId:
              student._id.toString(),

            month:
              month
                ? String(month)
                : "",

            year:
              year
                ? String(year)
                : ""
          },

          webpush: {
            fcmOptions: {
              link:
                "/student/dashboard"
            }
          }
        }
      );

    const invalidTokens = [];

    response.responses.forEach(
      (
        result,
        index
      ) => {
        if (
          !result.success
        ) {
          const errorCode =
            result.error?.code;

          if (
            errorCode ===
              "messaging/registration-token-not-registered" ||
            errorCode ===
              "messaging/invalid-registration-token"
          ) {
            invalidTokens.push(
              tokens[index]
            );
          }
        }
      }
    );

    if (
      invalidTokens.length > 0
    ) {
      await Student.findByIdAndUpdate(
        student._id,
        {
          $pull: {
            fcmTokens: {
              $in: invalidTokens
            }
          }
        }
      );
    }

    const sentCount =
      response.successCount;

    const failedCount =
      response.failureCount;

    notification.status =
      sentCount > 0
        ? "sent"
        : "failed";

    notification.sentAt =
      sentCount > 0
        ? new Date()
        : undefined;

    if (
      failedCount > 0
    ) {
      notification.error =
        `${failedCount} notification(s) failed.`;
    }

    await notification.save();

    return {
      success:
        sentCount > 0,

      notification,

      sentCount,

      failedCount
    };
  } catch (error) {
    notification.status =
      "failed";

    notification.error =
      error.message;

    await notification.save();

    throw error;
  }
}

export async function sendPushNotificationToMany({
  students,
  title,
  message,
  type = "announcement",
  month,
  year
}) {
  const results = [];

  for (
    const student of students
  ) {
    try {
      const result =
        await sendPushNotification({
          studentId:
            student._id,

          title,

          message,

          type,

          month,

          year
        });

      results.push({
        studentId:
          student._id,

        ...result
      });
    } catch (error) {
      results.push({
        studentId:
          student._id,

        success: false,

        error:
          error.message
      });
    }
  }

  return results;
}