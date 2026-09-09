import mongoose from "mongoose";


const notificationSchema =
  new mongoose.Schema(

    {

      studentId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Student",

        required: true,

        index: true

      },


      type: {

        type: String,

        enum: [
          "fee_reminder",
          "announcement"
        ],

        required: true

      },


      month: {

        type: Number,

        min: 1,

        max: 12

      },


      year: {

        type: Number

      },


      channel: {

        type: String,

        enum: [
          "push",
          "sms"
        ],

        required: true

      },


      title: {

        type: String,

        trim: true

      },


      message: {

        type: String,

        required: true

      },


      status: {

        type: String,

        enum: [
          "queued",
          "sent",
          "failed"
        ],

        default: "queued"

      },


      sentAt: {

        type: Date

      },


      error: {

        type: String

      }

    },

    {

      timestamps: true

    }

  );


export default mongoose.model(
  "Notification",
  notificationSchema
);