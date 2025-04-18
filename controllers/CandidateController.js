const Candidate = require("../models/candidateModel");
const User = require("../models/userModel");
const Education = require("../models/educationModel");
const bcrypt = require("bcrypt");
const Experience = require("../models/experienceModel");
const Certification = require("../models/certificationModel");
const Portfolio = require("../models/portfolioModel");
const createCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const role = "candidate";
    // Vérification du rôle
    if (!["admin", "recruiter", "candidate"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    // Vérification si l'email est déjà utilisé et le role candidate
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already in use" });
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
    res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getAllCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    // Pipeline d'agrégation pour rechercher dans user
    const pipeline = [
      {
        $lookup: {
          from: "users", // Nom de la collection User
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" }, // Transforme l'array en objet
    ];

    // Ajouter la recherche si elle existe
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.firstName": { $regex: search, $options: "i" } },
            { "user.lastName": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Compter le total des résultats après le filtrage
    const totalCandidates =
      (await Candidate.aggregate([...pipeline, { $count: "count" }]))[0]
        ?.count || 0;
    const totalPages = Math.ceil(totalCandidates / limit);

    // Ajouter pagination
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: parseInt(limit) });

    // Exécuter l'agrégation
    const candidates = await Candidate.aggregate(pipeline);

    res.status(200).json({
      status: "success",
      totalCandidates,
      totalPages,
      candidates,
      currentPage: parseInt(page),
    });
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
  const { permissions } = req.body;
  // console.log(req.body);

  try {
    // Vérification que le candidat existe
    const candidate = await Candidate.findById(id).populate("user");
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    // Mise à jour de la société dans la collection Candidate
    if (permissions) {
      candidate.permissions = permissions || candidate.permissions;
      await candidate.save(); // Sauvegarde des modifications
    }
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
      return res.status(404).json({ message: "Candidate not found" });
    }
    // Suppression du candidat dans la collection Candidate
    await Candidate.findByIdAndDelete(id);
    // Suppression de l'utilisateur dans la collection User
    await User.findByIdAndDelete(candidate.user._id);
    // Réponse après la suppression
    res.status(200).json({ message: "Candidate successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur obtenu par middleware d'authentification
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Vérification des champs requis
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Vérification si le nouveau mot de passe correspond à la confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    // Vérification de la longueur du mot de passe (bonne pratique)
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Récupération de l'utilisateur
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Vérification de l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }
    // Attribuer le nouveau mot de passe (il sera haché par le `pre("save")`)
    user.password = newPassword;

    // Sauvegarde de l'utilisateur avec le nouveau mot de passe
    await user.save();

    res.status(200).json({ message: "Password successfully updated" });
  } catch (error) {
    // console.error("Erreur lors du changement de mot de passe :", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProfilCandidate = async (req, res) => {
  const userId = req.user.id; // L'ID du candidat à mettre à jour obtenu par middlware
  const { phone, address, permissions } = req.body;
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
    candidate.permissions = permissions || candidate.permissions;

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
const getMe = async (req, res) => {
  try {
    const userId = req.user.id; // Assurez-vous que req.user.id est bien un ObjectId valide
    const candidate = await Candidate.findOne({ user: userId }).populate(
      "user"
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ candidate });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getPermission = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur obtenu par middleware d'authentification
    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json({ candidate });
  } catch (error) {
    // console.error("Erreur lors du changement de mot de passe :", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getInfoCandidate = async (req, res) => {
  try {
    // recupération du candidat
    const candidate = await Candidate.findById(req.params.id).populate("user");
    if (!candidate)
      return res.status(404).json({ message: "Candidat not found" });

    const education = await Education.find({ candidate: candidate._id });
    const experience = await Experience.find({ candidate: candidate._id });
    const certification = await Certification.find({
      candidate: candidate._id,
    });
    const portfolio = await Portfolio.find({
      candidate: candidate._id,
    });
    res.status(200).json({
      candidate,
      education,
      experience,
      certification,
      portfolio,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
  getMe,
  getPermission,
  getInfoCandidate,
};
