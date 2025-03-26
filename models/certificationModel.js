const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: true,
      trim: true,
    },
    dateObtained: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Certification = mongoose.model("Certification", certificationSchema);
module.exports = Certification;
