const mongoose = require("mongoose");
const candidateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: {
      type: String,
      enum: ["Pending", "Allowed", "Denied"],
      default: "Pending",
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String, // Rue
      city: String, // Ville
      country: String, // Pays
    },
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
