const mongoose = require("mongoose");
const jobPostSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
    },
    sector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sector",
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    remote: {
      type: Boolean,
      default: false, // Indique si le poste est en télétravail
    },
    contractType: {
      type: String,
      enum: ["CDI", "CDD", "Freelance", "Stage", "Alternance", "Intérim"],
    },
    experienceRequired: {
      type: String,
      enum: ["Débutant", "1 ans", "2 ans", "3 ans", "4 ans", "5 ans"],
    },
    studyLevels: {
      type: String,
      enum: ["Sans bac", "Bac", "Bac +2", "Bac +3", "Bac +4", "Bac +5"],
    },
    skills: {
      type: [String], // Tableau de compétences requises
    },
    deadline: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "expired", "closed"],
      default: "active",
    },
    permissions: {
      type: String,
      enum: ["Pending", "Allowed", "Denied"],
      default: "Pending",
    },
  },
  { timestamps: true }
);
const JobPost = mongoose.model("JobPost", jobPostSchema);
module.exports = JobPost;
