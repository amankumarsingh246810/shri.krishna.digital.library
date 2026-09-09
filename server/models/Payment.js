import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema(

  {

    /*
     * Student who paid
     */

    studentId: {

      type:
        mongoose.Schema.Types.ObjectId,

      ref: "Student",

      required: true,

      index: true

    },


    /*
     * Payment month
     *
     * Example:
     * 8 = August
     */

    month: {

      type: Number,

      required: true,

      min: 1,

      max: 12

    },


    /*
     * Payment year
     */

    year: {

      type: Number,

      required: true

    },


    /*
     * Amount collected by operator
     */

    amount: {

      type: Number,

      required: true,

      min: 0

    },


    /*
     * Since this system records completed
     * offline payments, status is paid.
     */

    status: {

      type: String,

      enum: ["paid"],

      default: "paid"

    },


    /*
     * How student paid physically
     */

    paymentMethod: {

      type: String,

      enum: [
        "cash",
        "upi_offline",
        "other"
      ],

      default: "cash"

    },


    /*
     * Date operator received money
     */

    paymentDate: {

      type: Date,

      required: true

    },


    /*
     * Optional library receipt number
     */

    receiptNumber: {

      type: String,

      trim: true

    },


    /*
     * Admin/operator who marked payment
     */

    markedBy: {

      type:
        mongoose.Schema.Types.ObjectId,

      ref: "Admin",

      required: true

    }

  },

  {

    timestamps: true

  }

);


/*
 * One student can have only one payment
 * record for a particular month/year.
 */

paymentSchema.index(

  {
    studentId: 1,
    month: 1,
    year: 1
  },

  {
    unique: true
  }

);


export default mongoose.model(
  "Payment",
  paymentSchema
);