const mongoose = require("mongoose");
const candidateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cv: {
      type: String, // Stocker l'URL du fichier CV
      required: [true, "Ce champ est requis"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
