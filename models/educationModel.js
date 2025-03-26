const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !this.startDate || value > this.startDate;
        },
        message: "La date de fin doit être après la date de début.",
      },
    },
  },
  { timestamps: true }
);
const Education = mongoose.model("Education", educationSchema);
module.exports = Education;
