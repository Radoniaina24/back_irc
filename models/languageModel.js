const mongoose = require("mongoose");
const languageSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true, // Langue obligatoire
  },
  proficiency: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Fluent", "Native"], // Niveau de maîtrise
    required: true, // Niveau obligatoire
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate", // Référence au modèle Candidate
    required: true,
  },
});
const Language = mongoose.model("Language", languageSchema);

module.exports = Language;
