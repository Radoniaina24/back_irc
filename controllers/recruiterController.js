const Recruiter = require("../models/recruiterModel");
const User = require("../models/userModel");
const Company = require("../models/companyModel");
const bcrypt = require("bcrypt");
const createRecruiter = async (req, res) => {
  try {
    const { firstName, lastName, email, password, companyName } = req.body;
    const role = "recruiter";

    // Vérification si l'email est déjà utilisé
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already in use" });
    }

    if (!companyName) {
      return res.status(400).json({
        message: "The company name is required for a recruiter",
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
      message: "Registration successful",
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
    const totalRecruiters =
      (await Recruiter.aggregate([...pipeline, { $count: "count" }]))[0]
        ?.count || 0;
    const totalPages = Math.ceil(totalRecruiters / limit);

    // Ajouter pagination
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: parseInt(limit) });

    // Exécuter l'agrégation
    const recruiters = await Recruiter.aggregate(pipeline);

    res
      .status(200)
      .json({
        status: "success",
        totalRecruiters,
        totalPages,
        recruiters,
        currentPage: parseInt(page),
      });
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
      return res.status(404).json({ message: "Recruiter not found" });
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
      .json({ message: "Recruiter updated successfully", recruiter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
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
      return res.status(404).json({ message: "Recruiter not found" });
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
      .json({ message: "Profile updated successfully", recruiter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params; // L'ID du recruteur à supprimer
    // Vérification que le recruteur existe
    const recruiter = await Recruiter.findById(id).populate("user");
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }
    // Suppression de l'entreprise associée
    await Company.deleteOne({ recruiter: recruiter._id });
    // Suppression du recruteur dans la collection Recruiter
    await Recruiter.findByIdAndDelete(id);
    // Suppression de l'utilisateur dans la collection User
    await User.findByIdAndDelete(recruiter.user._id);
    // Réponse après la suppression
    res.status(200).json({ message: "Recruiter deleted successfully" });
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
      return res.status(400).json({ message: "Passwords don't match" });
    }
    // Vérification de la longueur du mot de passe (bonne pratique)
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
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

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    // console.error("Erreur lors du changement de mot de passe :", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  createRecruiter,
  getAllRecruiters,
  getRecruiterById,
  deleteRecruiter,
  updateRecruiter,
  updateProfilRecruiter,
  changePassword,
};
