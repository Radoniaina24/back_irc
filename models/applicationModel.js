const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate", // Référence vers le candidat qui postule
      required: true,
    },
    jobPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost", // Référence vers l'annonce
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter", // Référence vers le recruteur (facultatif)
      required: true,
    },
    coverLetter: {
      type: String,
      required: false, // Optionnel : lettre de motivation
    },
    file: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
