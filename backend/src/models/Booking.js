const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    // Optionally store Google Calendar event id if synced
    google_event_id: {
      type: String,
    },
    calendar_id: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);