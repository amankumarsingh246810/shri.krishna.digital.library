import { getMessaging } from "firebase-admin/messaging";

import firebaseAdminApp from "../config/firebaseAdmin.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";

const messaging = getMessaging(firebaseAdminApp);

const INVALID_TOKEN_CODES = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered"
]);

function buildLink() {
  const baseUrl = (
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");

  return `${baseUrl}/student/dashboard`;
}

function isInvalidTokenError(error) {
  return INVALID_TOKEN_CODES.has(error?.code);
}

export async function sendNotificationToStudent({
  student,
  type,
  title,
  message,
  month,
  year
}) {
  const notification = await Notification.create({
    studentId: student._id,
    type,
    month,
    year,
    channel: "push",
    title,
    message,
    status: "queued"
  });

  const tokens = [
    ...(student.fcmTokens || [])
  ].filter(Boolean);

  if (tokens.length === 0) {
    notification.status = "failed";

    notification.error =
      "Student has no registered notification device.";

    await notification.save();

    return {
      notification,
      success: false,
      sentCount: 0,
      failedCount: 0,
      reason: notification.error
    };
  }

  const invalidTokens = [];

  let sentCount = 0;
  let failedCount = 0;

  try {
    /*
     * FCM supports up to 500 targets per
     * multicast request.
     */
    for (
      let start = 0;
      start < tokens.length;
      start += 500
    ) {
      const tokenChunk = tokens.slice(
        start,
        start + 500
      );

      const response =
        await messaging.sendEachForMulticast({
          tokens: tokenChunk,

          notification: {
            title,
            body: message
          },

          data: {
            type,
            notificationId:
              notification._id.toString(),

            studentId:
              student._id.toString(),

            ...(month
              ? {
                  month: String(month)
                }
              : {}),

            ...(year
              ? {
                  year: String(year)
                }
              : {})
          },

          webpush: {
            fcmOptions: {
              link: buildLink()
            },

            notification: {
              title,
              body: message,
              icon: "/favicon.ico"
            }
          }
        });

      sentCount += response.successCount;
      failedCount += response.failureCount;

      response.responses.forEach(
        (result, index) => {
          if (
            !result.success &&
            isInvalidTokenError(
              result.error
            )
          ) {
            invalidTokens.push(
              tokenChunk[index]
            );
          }
        }
      );
    }

    /*
     * Remove expired/invalid FCM tokens.
     */
    if (invalidTokens.length > 0) {
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

    notification.status =
      sentCount > 0
        ? "sent"
        : "failed";

    notification.sentAt =
      sentCount > 0
        ? new Date()
        : undefined;

    if (sentCount === 0) {
      notification.error =
        "FCM could not deliver the notification to any registered device.";
    }

    await notification.save();

    return {
      notification,
      success: sentCount > 0,
      sentCount,
      failedCount
    };
  } catch (error) {
    console.error(
      `FCM send failed for student ${student._id}:`,
      error
    );

    notification.status = "failed";

    notification.error =
      error?.message ||
      "Failed to send push notification";

    await notification.save();

    return {
      notification,
      success: false,
      sentCount,
      failedCount,
      reason: notification.error
    };
  }
}

export async function sendNotificationToStudents({
  students,
  type,
  title,
  message,
  month,
  year
}) {
  const results = [];

  for (const student of students) {
    const result =
      await sendNotificationToStudent({
        student,
        type,
        title,
        message,
        month,
        year
      });

    results.push({
      studentId: student._id,
      studentName: student.name,

      success: result.success,

      sentCount:
        result.sentCount,

      failedCount:
        result.failedCount,

      reason:
        result.reason || null
    });
  }

  return results;
}