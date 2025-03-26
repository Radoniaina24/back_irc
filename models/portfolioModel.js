const mongoose = require("mongoose");

// Définition du schéma pour un élément de portfolio
const portfolioSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate", // Référence au modèle Candidate
      required: true, // Chaque portfolio appartient à un candidat
    },
    title: {
      type: String,
      required: true,
      trim: true, // Supprime les espaces superflus
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skills: [
      {
        type: String,
        required: true,
        trim: true, // Assure que chaque compétence est sans espace superflu
      },
    ],
    file: {
      type: String,
      required: true, // Le fichier est obligatoire
    },
  },
  { timestamps: true } // Ajoute createdAt et updatedAt automatiquement
);
const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;
