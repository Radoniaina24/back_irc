const mongoose = require("mongoose");
const jobPostSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    sector: {
      type: String,
      required: [true, "Le secteur d'activité est requis"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Le titre du poste est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description du poste est requise"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Le lieu de travail est requis"],
      trim: true,
    },
    remote: {
      type: Boolean,
      default: false, // Indique si le poste est en télétravail
    },
    contractType: {
      type: String,
      enum: ["CDI", "CDD", "Freelance", "Stage", "Alternance", "Intérim"],
      required: [true, "Le type de contrat est requis"],
    },
    experienceRequired: {
      type: String,
      enum: ["Débutant", "1 ans", "2 ans", "3 ans", "4 ans", , "5 ans"],
      required: [true, "L'expérience requise est obligatoire"],
    },
    studyLevels: {
      type: String,
      enum: ["Sans bac", "Bac", "Bac +2", "Bac +3", "Bac +4", "Bac +5"],
      required: [true, "Le niveau d'étude  est obligatoire"],
    },
    skills: {
      type: [String], // Tableau de compétences requises
      required: [true, "Les compétences requises sont obligatoires"],
    },
    deadline: {
      type: String,
      required: [true, "La date limite de candidature est requise"],
    },
    status: {
      type: String,
      enum: ["active", "expirée", "fermée"],
      default: "active",
    },
  },
  { timestamps: true }
);
const JobPost = mongoose.model("JobPost", jobPostSchema);
module.exports = JobPost;
