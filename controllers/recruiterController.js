const Recruiter = require("../models/recruiterModel");
const User = require("../models/userModel");
const Company = require("../models/companyModel");
const createRecruiter = async (req, res) => {
  try {
    const { firstName, lastName, email, password, companyName } = req.body;
    const role = "recruiter";

    // Vérification si l'email est déjà utilisé
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    if (!companyName) {
      return res.status(400).json({
        message: "Le nom de l'entreprise est requis pour un recruteur",
      });
    }

    // Création de l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    // Création du recruteur
    const recruiter = await Recruiter.create({
      user: user._id,
    });

    // Création de l'entreprise
    const company = await Company.create({
      companyName,
      recruiter: recruiter._id, // Associer l'entreprise au recruteur
    });
    res.status(201).json({
      message: "Inscription réussie",
      user,
      recruiter,
      company,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
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
  const { func, phone } = req.body; // Nouvelle société ou autres données à mettre à jour

  try {
    // Vérification que le recruteur existe
    const recruiter = await Recruiter.findById(id).populate("user");
    if (!recruiter) {
      return res.status(404).json({ message: "Recruteur non trouvé" });
    }
    // Mise à jour du fonction et le numéro de téléphone la collection Recruiter

    recruiter.phone = phone;
    recruiter.function = func;
    await recruiter.save(); // Sauvegarde des modifications

    // Vous pouvez également mettre à jour d'autres informations liées à l'utilisateur, si nécessaire
    // Par exemple, si vous souhaitez mettre à jour les informations de l'utilisateur :
    const { firstName, lastName } = req.body;
    const user = recruiter.user;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save(); // Sauvegarde des modifications de l'utilisateur
    res
      .status(200)
      .json({ message: "Recruteur mis à jour avec succès", recruiter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const updateProfilRecruiter = async (req, res) => {
  const userId = req.user.id; // L'ID du recruteur à mettre à jour obtenu par middlware
  const { func, phone } = req.body; // Nouvelle société ou autres données à mettre à jour
  try {
    // Vérification que le recruteur existe
    const recruiter = await Recruiter.findOne({ user: userId }).populate(
      "user"
    );
    if (!recruiter) {
      return res.status(404).json({ message: "Recruteur non trouvé" });
    }
    // Mise à jour du fonction et le numéro de téléphone la collection Recruiter

    recruiter.phone = phone;
    recruiter.function = func;
    await recruiter.save(); // Sauvegarde des modifications

    // Vous pouvez également mettre à jour d'autres informations liées à l'utilisateur, si nécessaire
    // Par exemple, si vous souhaitez mettre à jour les informations de l'utilisateur :
    const { firstName, lastName } = req.body;
    const user = recruiter.user;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save(); // Sauvegarde des modifications de l'utilisateur
    res
      .status(200)
      .json({ message: "Profil mis à jour avec succès", recruiter });
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
    // Suppression de l'entreprise associée
    await Company.deleteOne({ recruiter: recruiter._id });
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
  updateProfilRecruiter,
};
