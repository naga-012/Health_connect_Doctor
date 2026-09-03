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
    patientName: {
      type: String,
      default: "Nagarjun Myakala"
    },
    patientEmail: {
      type: String,
      default: "myakalanagarjun09@gmail.com"
    },
    patientPhone: {
      type: String,
      default: "+91 9121792433"
    },
    userName: {
      type: String,
      default: "Nagarjun Myakala"
    },
    userEmail: {
      type: String,
      default: "myakalanagarjun09@gmail.com"
    },
    hospitalName: {
      type: String,
      default: "Apollo Hospital"
    },
    fee: {
      type: Number,
      default: 800
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
    cancelledBy: {
      type: String,
      default: ""
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
    },
    expireAt: {
      type: Date,
      index: { expires: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
