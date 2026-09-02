const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    slot: {
      type: String, // e.g. "2026-04-18 09:00-10:00"
      required: true
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      default: "UPI QR"
    },
    paymentTransactionId: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
