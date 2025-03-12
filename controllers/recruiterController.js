const Recruiter = require("../models/recruiterModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const createRecruiter = async (req, res) => {
  try {
    const { firstName, lastName, email, password, society } = req.body;
    const role = "recruiter";
    // Vérification si l'email est déjà utilisé
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }
    // Si le rôle est recruteur, créer une entrée dans la collection Recruiter
    if (role === "recruiter") {
      if (!society) {
        return res.status(400).json({
          message: "Le nom de la société est requis pour un recruteur",
        });
      }
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
    // Création d'un recruteur associé à l'utilisateur
    await Recruiter.create({
      user: user._id,
      society,
    });

    // Réponse réussie
    res.status(201).json({ message: "Inscription réussie", user, society });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const getAllRecruiters = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const searchQuery = search
      ? {
          $or: [{ society: { $regex: search, $options: "i" } }],
        }
      : {};
    const totalRecruiters = await Recruiter.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalRecruiters / limit);
    const recruiters = await Recruiter.find(searchQuery)
      .populate("user")
      .skip((page - 1) * limit)
      .limit(limit);
    res
      .status(200)
      .json({ status: "success", totalRecruiters, totalPages, recruiters });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRecruiterById = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id).populate("user");
    if (!recruiter)
      return res.status(404).json({ message: "Recruteur non trouvé" });
    res.status(200).json(recruiter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updateRecruiter = async (req, res) => {
  const { id } = req.params; // L'ID du recruteur à mettre à jour
  const { society } = req.body; // Nouvelle société ou autres données à mettre à jour

  try {
    // Vérification que le recruteur existe
    const recruiter = await Recruiter.findById(id).populate("user");
    if (!recruiter) {
      return res.status(404).json({ message: "Recruteur non trouvé" });
    }

    // Validation des données (exemple : la société ne peut pas être vide)
    if (society && society.trim() === "") {
      return res
        .status(400)
        .json({ message: "Le nom de la société ne peut pas être vide" });
    }

    // Mise à jour de la société dans la collection Recruiter
    if (society) {
      recruiter.society = society;
      await recruiter.save(); // Sauvegarde des modifications
    }

    // Vous pouvez également mettre à jour d'autres informations liées à l'utilisateur, si nécessaire
    // Par exemple, si vous souhaitez mettre à jour les informations de l'utilisateur :
    const { firstName, lastName, email } = req.body;
    const user = recruiter.user;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    await user.save(); // Sauvegarde des modifications de l'utilisateur

    res
      .status(200)
      .json({ message: "Recruteur mis à jour avec succès", recruiter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params; // L'ID du recruteur à supprimer
    // Vérification que le recruteur existe
    const recruiter = await Recruiter.findById(id).populate("user");
    if (!recruiter) {
      return res.status(404).json({ message: "Recruteur non trouvé" });
    }
    // Suppression du recruteur dans la collection Recruiter
    await Recruiter.findByIdAndDelete(id);
    // Suppression de l'utilisateur dans la collection User
    await User.findByIdAndDelete(recruiter.user._id);
    // Réponse après la suppression
    res.status(200).json({ message: "Recruteur supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  createRecruiter,
  getAllRecruiters,
  getRecruiterById,
  deleteRecruiter,
  updateRecruiter,
};
