const mongoose = require("mongoose");
const jobPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre du poste est requis"],
      trim: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
  },
  { timestamps: true }
);
const JobPost = mongoose.model("JobPost", jobPostSchema);
module.exports = JobPost;
