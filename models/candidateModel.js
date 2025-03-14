const mongoose = require("mongoose");
const candidateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String, // Rue
      city: String, // Ville
      state: String, // État / Région
      zip: String, // Code postal
      country: String, // Pays
    },
    resume: {
      type: String, // URL du fichier CV stocké sur le serveur ou un service cloud
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: [
      {
        company: String, // Entreprise
        position: String, // Poste
        startDate: Date, // Date de début
        endDate: Date, // Date de fin
        description: String, // Description
      },
    ],
    education: [
      {
        institution: String, // Établissement
        degree: String, // Diplôme
        fieldOfStudy: String, // Domaine d'études
        startDate: Date, // Date de début
        endDate: Date, // Date de fin
      },
    ],
    certifications: [
      {
        name: String, // Nom
        issuingOrganization: String, // Organisme délivrant
        dateObtained: Date, // Date d'obtention
      },
    ],
    languages: [
      {
        language: String, // Langue
        proficiency: {
          type: String,
          enum: ["Débutant", "Intermédiaire", "Avancé", "Courant", "Natif"], // Niveau de maîtrise
        },
      },
    ],
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
