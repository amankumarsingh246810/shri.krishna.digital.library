import mongoose from "mongoose";

const paymentAuditSchema =
  new mongoose.Schema(
    {
      /*
       * Payment that this audit entry belongs to.
       */
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        required: true,
        index: true
      },

      /*
       * Student associated with the payment.
       *
       * Keeping studentId here makes it easier
       * to query audit history for a student
       * even if the payment record changes later.
       */
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true
      },

      /*
       * Admin who performed the action.
       */
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
        index: true
      },

      /*
       * Action performed on the payment.
       */
      action: {
        type: String,
        enum: [
          "created",
          "correction_requested",
          "corrected",
          "cancelled"
        ],
        required: true,
        index: true
      },

      /*
       * Previous payment information.
       *
       * This is stored as a snapshot so that
       * we can see what the payment looked like
       * before a correction.
       */
      previousData: {
        month: {
          type: Number
        },

        year: {
          type: Number
        },

        amount: {
          type: Number
        },

        status: {
          type: String
        },

        paymentMethod: {
          type: String
        },

        paymentDate: {
          type: Date
        },

        receiptNumber: {
          type: String
        }
      },

      /*
       * New payment information after correction.
       *
       * This allows us to compare the old
       * and new values.
       */
      newData: {
        month: {
          type: Number
        },

        year: {
          type: Number
        },

        amount: {
          type: Number
        },

        status: {
          type: String
        },

        paymentMethod: {
          type: String
        },

        paymentDate: {
          type: Date
        },

        receiptNumber: {
          type: String
        }
      },

      /*
       * Mandatory explanation for a correction
       * or cancellation.
       */
      reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
      }
    },
    {
      timestamps: true
    }
  );

/*
 * Useful for retrieving the complete audit
 * history of a particular payment.
 */
paymentAuditSchema.index({
  paymentId: 1,
  createdAt: -1
});

/*
 * Useful for retrieving all actions performed
 * by a particular admin.
 */
paymentAuditSchema.index({
  adminId: 1,
  createdAt: -1
});

/*
 * Useful for retrieving all audit records
 * associated with a student.
 */
paymentAuditSchema.index({
  studentId: 1,
  createdAt: -1
});

const PaymentAudit =
  mongoose.model(
    "PaymentAudit",
    paymentAuditSchema
  );

export default PaymentAudit;