const Candidate = require("../models/candidateModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const createCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const role = "candidate";
    // Vérification du rôle
    if (!["admin", "recruiter", "candidate"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }
    // Vérification si l'email est déjà utilisé et le role candidate
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }
    // Création de l'utilisateur
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    await user.save();
    // Si le rôle est candidat, créer une entrée dans la collection Candidate
    await Candidate.create({ user: user._id });

    // Réponse réussie
    res.status(201).json({ message: "Inscription réussie", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const getAllCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const searchQuery = search
      ? {
          $or: [{ cv: { $regex: search, $options: "i" } }],
        }
      : {};
    const totalCandidates = await Candidate.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCandidates / limit);
    const candidates = await Candidate.find(searchQuery)
      .populate("user")
      .skip((page - 1) * limit)
      .limit(limit);
    res
      .status(200)
      .json({ status: "success", totalCandidates, totalPages, candidates });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate("user");
    if (!candidate)
      return res.status(404).json({ message: "Candidat non trouvé" });
    res.status(200).json(candidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updateCandidate = async (req, res) => {
  const { id } = req.params; // L'ID du candidat à mettre à jour
  const { cv } = req.body; // Nouvelle société ou autres données à mettre à jour

  try {
    // Vérification que le candidat existe
    const candidate = await Candidate.findById(id).populate("user");
    if (!candidate) {
      return res.status(404).json({ message: "Recruteur non trouvé" });
    }

    // Validation des données (exemple : la société ne peut pas être vide)
    if (cv && cv.trim() === "") {
      return res
        .status(400)
        .json({ message: "Le nom de la société ne peut pas être vide" });
    }

    // Mise à jour de la société dans la collection Candidate
    if (cv) {
      candidate.cv = cv;
      await candidate.save(); // Sauvegarde des modifications
    }

    // Vous pouvez également mettre à jour d'autres informations liées à l'utilisateur, si nécessaire
    // Par exemple, si vous souhaitez mettre à jour les informations de l'utilisateur :
    const { firstName, lastName, email } = req.body;
    const user = candidate.user;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    await user.save(); // Sauvegarde des modifications de l'utilisateur

    res
      .status(200)
      .json({ message: "Candidat mis à jour avec succès", candidate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params; // L'ID du candidat à supprimer
    // Vérification que le candidat existe
    const candidate = await Candidate.findById(id).populate("user");
    if (!candidate) {
      return res.status(404).json({ message: "Candidat non trouvé" });
    }
    // Suppression du candidat dans la collection Candidate
    await Candidate.findByIdAndDelete(id);
    // Suppression de l'utilisateur dans la collection User
    await User.findByIdAndDelete(candidate.user._id);
    // Réponse après la suppression
    res.status(200).json({ message: "Candidat supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur obtenu par middleware d'authentification
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Vérification des champs requis
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérification si le nouveau mot de passe correspond à la confirmation
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas" });
    }
    // Vérification de la longueur du mot de passe (bonne pratique)
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Récupération de l'utilisateur
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    // Vérification de l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }
    // Attribuer le nouveau mot de passe (il sera haché par le `pre("save")`)
    user.password = newPassword;

    // Sauvegarde de l'utilisateur avec le nouveau mot de passe
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    // console.error("Erreur lors du changement de mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const updateProfilCandidate = async (req, res) => {
  const userId = req.user.id; // L'ID du candidat à mettre à jour obtenu par middlware
  const {
    phone,
    address,
    resume,
    skills,
    experience,
    education,
    certifications,
    languages,
  } = req.body;
  try {
    // Vérification que le candidat existe
    const candidate = await Candidate.findOne({ user: userId }).populate(
      "user"
    );
    if (!candidate) {
      return res.status(404).json({ message: "Candidat non trouvé" });
    }
    // Mise à jour du fonction et le numéro de téléphone la collection Recruiter

    candidate.phone = phone || candidate.phone;
    candidate.address = address || candidate.address;
    candidate.resume = resume || candidate.resume;
    candidate.skills = skills || candidate.skills;
    candidate.experience = experience || candidate.experience;
    candidate.education = education || candidate.education;
    candidate.certifications = certifications || candidate.certifications;
    candidate.languages = languages || candidate.languages;

    await candidate.save(); // Sauvegarde des modifications

    // Vous pouvez également mettre à jour d'autres informations liées à l'utilisateur, si nécessaire
    // Par exemple, si vous souhaitez mettre à jour les informations de l'utilisateur :
    const { firstName, lastName } = req.body;
    const user = candidate.user;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save(); // Sauvegarde des modifications de l'utilisateur
    res
      .status(200)
      .json({ message: "Profil mis à jour avec succès", candidate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  deleteCandidate,
  updateCandidate,
  changePassword,
  updateProfilCandidate,
};
