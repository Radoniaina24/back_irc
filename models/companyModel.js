const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Le nom de l’entreprise est requis"],
      trim: true,
    },
    industry: {
      type: String,
      required: false,
      trim: true,
    },
    companySize: {
      type: Number,
      required: false,
    },
    headquarters: {
      address: { type: String, required: false, trim: true },
      city: { type: String, required: false, trim: true },
      country: { type: String, required: false, trim: true },
    },
    website: {
      type: String,
      required: false,
      trim: true,
      match: [
        /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/,
        "Veuillez entrer une URL valide",
      ],
    },
    logo: {
      type: String,
      required: false, // URL du logo stocké
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
