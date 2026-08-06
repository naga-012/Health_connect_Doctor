const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    rating: {
      type: Number,
      default: 4.5
    },
    departments: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
