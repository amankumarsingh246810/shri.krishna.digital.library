import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    fatherName: {
      type: String,
      required: true,
      trim: true
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    address: {
      type: String,
      trim: true
    },

    seatNumber: {
      type: String,
      trim: true
    },

    monthlyFee: {
      type: Number,
      required: true,
      min: 0
    },

    enrollmentStatus: {
      type: String,
      enum: [
        "pending",
        "active",
        "inactive"
      ],
      default: "active",
      index: true
    },

    enrollmentDate: {
      type: Date
    },

    /*
     * Firebase Cloud Messaging device tokens.
     *
     * A student may log in from multiple
     * devices, so we store an array.
     */
    fcmTokens: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

studentSchema.index({
  enrollmentStatus: 1,
  createdAt: -1
});

const Student =
  mongoose.model(
    "Student",
    studentSchema
  );

export default Student;