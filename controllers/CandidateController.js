const Candidate = require("../models/candidateModel");
const User = require("../models/userModel");
const createCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, cv } = req.body;

    // Vérification du rôle
    if (!["admin", "candidate", "candidate"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    // Vérification si l'email est déjà utilisé
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
    if (role === "candidate") {
      if (!cv) {
        return res.status(400).json({
          message: "Le CV est requis pour un candidat",
        });
      }
      // Création d'un candidat associé à l'utilisateur
      await Candidate.create({ user: user._id, cv });
    }
    // Réponse réussie
    res.status(201).json({ message: "Inscription réussie", user, cv });
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

module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  deleteCandidate,
  updateCandidate,
};
