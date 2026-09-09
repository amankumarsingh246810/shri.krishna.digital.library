import cron from "node-cron";

import Student from "../models/Student.js";
import Payment from "../models/Payment.js";

import {
  sendPushNotification
} from "../services/notificationService.js";

async function sendMonthlyFeeReminders() {
  try {
    const now =
      new Date();

    const month =
      now.getMonth() + 1;

    const year =
      now.getFullYear();

    console.log(
      `Checking unpaid fees for ${month}/${year}...`
    );

    const activeStudents =
      await Student.find({
        enrollmentStatus:
          "active"
      });

    let reminderCount =
      0;

    for (
      const student of activeStudents
    ) {
      const payment =
        await Payment.findOne({
          studentId:
            student._id,

          month,

          year,

          status: "paid"
        });

      if (payment) {
        continue;
      }

      if (
        !student.fcmTokens ||
        student.fcmTokens.length === 0
      ) {
        continue;
      }

      try {
        await sendPushNotification({
          studentId:
            student._id,

          title:
            "Monthly Fee Reminder",

          message:
            `Your library fee of ₹${student.monthlyFee} for ${new Date(
              year,
              month - 1,
              1
            ).toLocaleString(
              "en-IN",
              {
                month: "long"
              }
            )} is currently unpaid. Please contact the library operator.`,

          type:
            "fee_reminder",

          month,

          year
        });

        reminderCount += 1;
      } catch (error) {
        console.error(
          `Failed to send reminder to ${student.name}:`,
          error.message
        );
      }
    }

    console.log(
      `Fee reminder job completed. Reminders attempted: ${reminderCount}`
    );
  } catch (error) {
    console.error(
      "Fee reminder job error:",
      error
    );
  }
}

export function startFeeReminderJob() {
  /*
   * Runs every day at 10:00 AM.
   *
   * Server timezone should be configured
   * appropriately in production.
   */
  cron.schedule(
    "0 10 * * *",
    async () => {
      console.log(
        "Running scheduled fee reminder job..."
      );

      await sendMonthlyFeeReminders();
    }
  );

  console.log(
    "✅ Fee reminder scheduler started."
  );
}

export async function runFeeReminderJobNow() {
  await sendMonthlyFeeReminders();
}