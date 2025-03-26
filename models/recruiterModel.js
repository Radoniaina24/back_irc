const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const recruiterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    function: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
    },
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
    address: { type: String, required: false, trim: true },
    city: { type: String, required: false, trim: true },
    country: { type: String, required: false, trim: true },
    website: {
      type: String,
      required: false,
      trim: true,
    },
    logo: {
      type: String,
      required: false, // URL du logo stocké
    },
  },
  {
    timestamps: true,
  }
);

// Hachage du mot de passe avant sauvegarde
recruiterSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Vérification du mot de passe
recruiterSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Recruiter = mongoose.model("Recruiter", recruiterSchema);
module.exports = Recruiter;
