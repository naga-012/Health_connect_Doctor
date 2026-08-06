const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  date: {
    type: String, // e.g. "2026-04-18"
    required: true
  },
  time: {
    type: String, // e.g. "09:00-10:00"
    required: true
  },
  available: {
    type: Boolean,
    default: true
  }
});

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    specialty: {
      type: String,
      required: true,
      trim: true
    },
    hospitals: [
      {
        type: String,
        trim: true
      }
    ],
    experience: {
      type: String,
      default: "5+ years"
    },
    consultationFee: {
      type: Number,
      default: 500
    },
    rating: {
      type: Number,
      default: 4.8
    },
    slots: [slotSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
