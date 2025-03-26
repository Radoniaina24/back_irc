const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    skills: [
      {
        type: String,
        trim: true, // Enlever les espaces superflus
      },
    ],
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate", // Référence au modèle Candidate
      required: true, // Un candidat obligatoire pour chaque compétence
    },
  },
  { timestamps: true }
); // Ajout de la gestion des dates de création et de mise à jour

const Skill = mongoose.model("Skill", skillSchema);

module.exports = Skill;
