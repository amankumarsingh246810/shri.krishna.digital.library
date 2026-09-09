import mongoose from "mongoose";

import Payment from "../models/Payment.js";
import PaymentAudit from "../models/PaymentAudit.js";
import Student from "../models/Student.js";


// ======================================================
// CREATE PAYMENT
// POST /api/payments
// ======================================================

export async function createPayment(req, res) {
  const session = await mongoose.startSession();

  try {
    const {
      studentId,
      month,
      year,
      amount,
      paymentMethod,
      receiptNumber
    } = req.body;

    // -----------------------------------------------
    // Validate required fields
    // -----------------------------------------------

    if (
      !studentId ||
      month === undefined ||
      year === undefined ||
      amount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student, month, year and amount are required"
      });
    }

    // -----------------------------------------------
    // Convert numeric values
    // -----------------------------------------------

    const numericMonth = Number(month);
    const numericYear = Number(year);
    const numericAmount = Number(amount);

    // -----------------------------------------------
    // Validate month
    // -----------------------------------------------

    if (
      !Number.isInteger(numericMonth) ||
      numericMonth < 1 ||
      numericMonth > 12
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Month must be an integer between 1 and 12"
      });
    }

    // -----------------------------------------------
    // Validate year
    // -----------------------------------------------

    if (
      !Number.isInteger(numericYear) ||
      numericYear < 2000 ||
      numericYear > 2100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year"
      });
    }

    // -----------------------------------------------
    // Validate amount
    // -----------------------------------------------

    if (
      Number.isNaN(numericAmount) ||
      numericAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount cannot be negative"
      });
    }

    // -----------------------------------------------
    // Validate payment method
    // -----------------------------------------------

    const allowedPaymentMethods = [
      "cash",
      "upi_offline",
      "other"
    ];

    const normalizedPaymentMethod =
      paymentMethod || "cash";

    if (
      !allowedPaymentMethods.includes(
        normalizedPaymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method"
      });
    }

    // -----------------------------------------------
    // Check student
    // -----------------------------------------------

    const student =
      await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // -----------------------------------------------
    // Check duplicate payment
    // -----------------------------------------------

    const existingPayment =
      await Payment.findOne({
        studentId,
        month: numericMonth,
        year: numericYear
      });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message:
          "Payment for this student and month already exists"
      });
    }

    // -----------------------------------------------
    // Start transaction
    // -----------------------------------------------

    session.startTransaction();

    // -----------------------------------------------
    // Create payment
    // -----------------------------------------------

    const paymentDocuments =
      await Payment.create(
        [
          {
            studentId,
            month: numericMonth,
            year: numericYear,
            amount: numericAmount,
            status: "paid",
            paymentMethod:
              normalizedPaymentMethod,
            paymentDate: new Date(),
            receiptNumber:
              receiptNumber?.trim() ||
              undefined,
            markedBy: req.user._id
          }
        ],
        {
          session
        }
      );

    const payment =
      paymentDocuments[0];

    // -----------------------------------------------
    // Create initial audit record
    // -----------------------------------------------

    await PaymentAudit.create(
      [
        {
          paymentId: payment._id,
          studentId: payment.studentId,
          adminId: req.user._id,

          action: "created",

          /*
           * Snapshot of the payment when it
           * was initially created.
           */
          previousData: undefined,

          newData: {
            month: payment.month,
            year: payment.year,
            amount: payment.amount,
            status: payment.status,
            paymentMethod:
              payment.paymentMethod,
            paymentDate:
              payment.paymentDate,
            receiptNumber:
              payment.receiptNumber
          },

          reason:
            "Payment initially recorded by library operator"
        }
      ],
      {
        session
      }
    );

    // -----------------------------------------------
    // Commit transaction
    // -----------------------------------------------

    await session.commitTransaction();

    // -----------------------------------------------
    // Populate student/admin information
    // -----------------------------------------------

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

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Payment recorded successfully",
      payment: populatedPayment
    });

  } catch (error) {
    // -----------------------------------------------
    // Rollback transaction
    // -----------------------------------------------

    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "Create payment error:",
      error
    );

    // -----------------------------------------------
    // MongoDB duplicate-key error
    // -----------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Payment for this student and month already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to record payment"
    });

  } finally {
    await session.endSession();
  }
}


// ======================================================
// GET ALL PAYMENTS
// GET /api/payments
// ======================================================

export async function getPayments(req, res) {
  try {
    const payments =
      await Payment.find()
        .populate(
          "studentId",
          "name fatherName phoneNumber seatNumber monthlyFee"
        )
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
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error(
      "Get payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payments"
    });
  }
}


// ======================================================
// GET PAYMENT BY ID
// GET /api/payments/:id
// ======================================================

export async function getPaymentById(
  req,
  res
) {
  try {
    const payment =
      await Payment.findById(
        req.params.id
      )
        .populate(
          "studentId",
          "name fatherName phoneNumber seatNumber monthlyFee"
        )
        .populate(
          "markedBy",
          "name email"
        );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      payment
    });

  } catch (error) {
    console.error(
      "Get payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment"
    });
  }
}


// ======================================================
// GET PAYMENTS FOR A STUDENT
// GET /api/payments/student/:studentId
// ======================================================

export async function getStudentPayments(
  req,
  res
) {
  try {
    const { studentId } =
      req.params;

    // -----------------------------------------------
    // Check student
    // -----------------------------------------------

    const student =
      await Student.findById(
        studentId
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found"
      });
    }

    // -----------------------------------------------
    // Get payments
    // -----------------------------------------------

    const payments =
      await Payment.find({
        studentId
      })
        .populate(
          "markedBy",
          "name email"
        )
        .sort({
          year: -1,
          month: -1
        });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error(
      "Get student payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch student payments"
    });
  }
}


// ======================================================
// GET MONTHLY PAYMENT STATUS
// GET /api/payments/status/:year/:month
// ======================================================

export async function getMonthlyPaymentStatus(
  req,
  res
) {
  try {
    const {
      year,
      month
    } = req.params;

    const numericYear =
      Number(year);

    const numericMonth =
      Number(month);

    // -----------------------------------------------
    // Validate month/year
    // -----------------------------------------------

    if (
      !Number.isInteger(
        numericMonth
      ) ||
      numericMonth < 1 ||
      numericMonth > 12
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Month must be an integer between 1 and 12"
      });
    }

    if (
      !Number.isInteger(
        numericYear
      ) ||
      numericYear < 2000 ||
      numericYear > 2100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid year"
      });
    }

    // -----------------------------------------------
    // Get active students
    // -----------------------------------------------

    const students =
      await Student.find({
        enrollmentStatus:
          "active"
      })
        .select(
          "name fatherName phoneNumber seatNumber monthlyFee"
        )
        .sort({
          name: 1
        });

    // -----------------------------------------------
    // Get payments for selected month
    // -----------------------------------------------

    const payments =
      await Payment.find({
        month: numericMonth,
        year: numericYear,
        status: "paid"
      }).select(
        "studentId amount paymentMethod paymentDate receiptNumber"
      );

    // -----------------------------------------------
    // Create payment lookup
    // -----------------------------------------------

    const paymentMap =
      new Map();

    payments.forEach(
      (payment) => {
        paymentMap.set(
          payment.studentId.toString(),
          payment
        );
      }
    );

    // -----------------------------------------------
    // Combine students + payment status
    // -----------------------------------------------

    const result =
      students.map(
        (student) => {
          const payment =
            paymentMap.get(
              student._id.toString()
            );

          return {
            student,
            payment:
              payment || null,
            paymentStatus:
              payment
                ? "paid"
                : "unpaid"
          };
        }
      );

    // -----------------------------------------------
    // Summary
    // -----------------------------------------------

    const paidCount =
      result.filter(
        (item) =>
          item.paymentStatus ===
          "paid"
      ).length;

    const unpaidCount =
      result.filter(
        (item) =>
          item.paymentStatus ===
          "unpaid"
      ).length;

    const totalCollected =
      payments.reduce(
        (
          total,
          payment
        ) =>
          total +
          payment.amount,
        0
      );

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    return res.status(200).json({
      success: true,

      month:
        numericMonth,

      year:
        numericYear,

      summary: {
        totalStudents:
          students.length,

        paidStudents:
          paidCount,

        unpaidStudents:
          unpaidCount,

        totalCollected
      },

      students:
        result
    });

  } catch (error) {
    console.error(
      "Monthly payment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch monthly payment status"
    });
  }
}