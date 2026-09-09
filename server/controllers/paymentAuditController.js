import Payment from "../models/Payment.js";
import PaymentAudit from "../models/PaymentAudit.js";
import Student from "../models/Student.js";

function createPaymentSnapshot(payment) {
  return {
    month: payment.month,
    year: payment.year,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    receiptNumber: payment.receiptNumber
  };
}

/*
 * Get all payment audit records
 */
export async function getPaymentAudits(
  req,
  res
) {
  try {
    const audits =
      await PaymentAudit.find()
        .populate(
          "paymentId",
          "month year amount status paymentMethod paymentDate receiptNumber"
        )
        .populate(
          "studentId",
          "name fatherName phoneNumber seatNumber"
        )
        .populate(
          "adminId",
          "name email"
        )
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      success: true,
      count: audits.length,
      audits
    });
  } catch (error) {
    console.error(
      "Get payment audits error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment audit history"
    });
  }
}

/*
 * Get audit history for a specific payment
 */
export async function getPaymentAuditByPaymentId(
  req,
  res
) {
  try {
    const { paymentId } = req.params;

    const payment =
      await Payment.findById(
        paymentId
      ).populate(
        "studentId",
        "name fatherName phoneNumber seatNumber"
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const audits =
      await PaymentAudit.find({
        paymentId
      })
        .populate(
          "adminId",
          "name email"
        )
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      success: true,
      payment,
      count: audits.length,
      audits
    });
  } catch (error) {
    console.error(
      "Get payment audit by payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment audit history"
    });
  }
}

/*
 * Get audit history for a specific student
 */
export async function getStudentPaymentAudits(
  req,
  res
) {
  try {
    const { studentId } = req.params;

    const student =
      await Student.findById(
        studentId
      ).select(
        "name fatherName phoneNumber seatNumber"
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const audits =
      await PaymentAudit.find({
        studentId
      })
        .populate(
          "paymentId",
          "month year amount status paymentMethod paymentDate receiptNumber"
        )
        .populate(
          "adminId",
          "name email"
        )
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      success: true,
      student,
      count: audits.length,
      audits
    });
  } catch (error) {
    console.error(
      "Get student payment audits error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch student payment audit history"
    });
  }
}

/*
 * Correct an existing payment
 */
export async function correctPayment(
  req,
  res
) {
  try {
    const { paymentId } = req.params;

    const {
      month,
      year,
      amount,
      paymentMethod,
      paymentDate,
      receiptNumber,
      reason
    } = req.body;

    /*
     * Reason is mandatory for every correction.
     */
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "A correction reason is required"
      });
    }

    if (reason.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message:
          "Correction reason cannot exceed 500 characters"
      });
    }

    const payment =
      await Payment.findById(
        paymentId
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    /*
     * Only paid records can currently be
     * corrected.
     */
    if (payment.status !== "paid") {
      return res.status(400).json({
        success: false,
        message:
          "Only paid payments can be corrected"
      });
    }

    /*
     * Save the complete old payment state
     * before making any changes.
     */
    const previousData =
      createPaymentSnapshot(payment);

    /*
     * Prepare the new values.
     */
    const newMonth =
      month !== undefined
        ? Number(month)
        : payment.month;

    const newYear =
      year !== undefined
        ? Number(year)
        : payment.year;

    const newAmount =
      amount !== undefined
        ? Number(amount)
        : payment.amount;

    const newPaymentMethod =
      paymentMethod !== undefined
        ? paymentMethod
        : payment.paymentMethod;

    const newPaymentDate =
      paymentDate !== undefined
        ? new Date(paymentDate)
        : payment.paymentDate;

    const newReceiptNumber =
      receiptNumber !== undefined
        ? receiptNumber.trim()
        : payment.receiptNumber;

    /*
     * Validate month.
     */
    if (
      newMonth < 1 ||
      newMonth > 12 ||
      !Number.isInteger(newMonth)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Month must be an integer between 1 and 12"
      });
    }

    /*
     * Validate year.
     */
    if (
      newYear < 2000 ||
      newYear > 2100 ||
      !Number.isInteger(newYear)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year"
      });
    }

    /*
     * Validate amount.
     */
    if (
      Number.isNaN(newAmount) ||
      newAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount cannot be negative"
      });
    }

    /*
     * Validate payment method.
     */
    const allowedMethods = [
      "cash",
      "upi_offline",
      "other"
    ];

    if (
      !allowedMethods.includes(
        newPaymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method"
      });
    }

    /*
     * Validate payment date.
     */
    if (
      Number.isNaN(
        newPaymentDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment date"
      });
    }

    /*
     * If month/year are changed, make sure
     * another payment does not already exist
     * for the same student and month.
     */
    if (
      newMonth !== payment.month ||
      newYear !== payment.year
    ) {
      const existingPayment =
        await Payment.findOne({
          studentId: payment.studentId,
          month: newMonth,
          year: newYear,
          _id: {
            $ne: payment._id
          }
        });

      if (existingPayment) {
        return res.status(409).json({
          success: false,
          message:
            "A payment already exists for this student and month"
        });
      }
    }

    /*
     * Update payment.
     */
    payment.month = newMonth;
    payment.year = newYear;
    payment.amount = newAmount;
    payment.paymentMethod =
      newPaymentMethod;
    payment.paymentDate =
      newPaymentDate;

    payment.receiptNumber =
      newReceiptNumber || undefined;

    await payment.save();

    /*
     * Save new payment snapshot.
     */
    const newData =
      createPaymentSnapshot(payment);

    /*
     * Create audit record.
     */
    const audit =
      await PaymentAudit.create({
        paymentId: payment._id,
        studentId: payment.studentId,
        adminId: req.user._id,
        action: "corrected",
        previousData,
        newData,
        reason: reason.trim()
      });

    const populatedPayment =
      await Payment.findById(
        payment._id
      )
        .populate(
          "studentId",
          "name fatherName phoneNumber seatNumber monthlyFee"
        )
        .populate(
          "markedBy",
          "name email"
        );

    const populatedAudit =
      await PaymentAudit.findById(
        audit._id
      ).populate(
        "adminId",
        "name email"
      );

    return res.status(200).json({
      success: true,
      message:
        "Payment corrected successfully",
      payment: populatedPayment,
      audit: populatedAudit
    });
  } catch (error) {
    console.error(
      "Correct payment error:",
      error
    );

    /*
     * MongoDB duplicate-key error.
     */
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A payment already exists for this student and month"
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to correct payment"
    });
  }
}