const JobPost = require("../models/jobPostModel");
const Recruiter = require("../models/recruiterModel");

const createJobPost = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id; // Récupéré via le middleware d'authentification

    // Vérifier si l'utilisateur est un recruteur
    const recruiter = await Recruiter.findOne({ user: userId });

    if (!recruiter) {
      return res
        .status(403)
        .json({ message: "Accès refusé. Recruteur requis." });
    }
    // Créer et enregistrer l'annonce
    const jobPost = new JobPost({
      title,
      recruiter: recruiter._id,
    });
    await jobPost.save();
    res.status(201).json({ message: "Annonce crée avec succès", jobPost });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
const getMyJobPosts = async (req, res) => {
  try {
    const userId = req.user.id; // Récupéré depuis le middleware d'authentification
    // Trouver le recruteur lié à cet utilisateur
    const recruiter = await Recruiter.findOne({ user: userId });
    if (!recruiter) {
      return res
        .status(403)
        .json({ message: "Accès refusé. Recruteur requis." });
    }
    // Récupérer toutes les annonces créées par ce recruteur
    let { page = 1, limit = 10, search } = req.query;

    // Validation et conversion des paramètres en nombres
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100)); // Limite à 100 max

    const searchQuery = search
      ? { $or: [{ title: { $regex: search, $options: "i" } }] }
      : {};

    // Exécuter les requêtes en parallèle pour améliorer les performances
    const [totalJobPosts, jobPosts] = await Promise.all([
      JobPost.countDocuments({ recruiter: recruiter._id, ...searchQuery }),
      JobPost.find({ recruiter: recruiter._id, ...searchQuery })
        .populate("recruiter")
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    const totalPages = Math.ceil(totalJobPosts / limit);

    res.status(200).json({
      success: true,
      totalJobPosts,
      totalPages,
      currentPage: page,
      jobPosts,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
const getAllJobPosts = async (req, res) => {
  try {
    // Récupérer toutes les annonces créées par ce recruteur
    let { page = 1, limit = 10, search } = req.query;

    // Validation et conversion des paramètres en nombres
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100)); // Limite à 100 max

    const searchQuery = search
      ? { $or: [{ title: { $regex: search, $options: "i" } }] }
      : {};
    // Exécuter les requêtes en parallèle pour améliorer les performances
    const [totalJobPosts, jobPosts] = await Promise.all([
      JobPost.countDocuments(searchQuery),
      JobPost.find(searchQuery)
        .populate("recruiter")
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    const totalPages = Math.ceil(totalJobPosts / limit);
    res.status(200).json({
      success: true,
      totalJobPosts,
      totalPages,
      currentPage: page,
      jobPosts,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
const getJobPostById = async (req, res) => {
  try {
    const jobPost = await JobPost.findById(req.params.id).populate("recruiter");
    if (!jobPost)
      return res.status(404).json({ message: "Annonce non trouvé" });
    res.status(200).json(jobPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteJobPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Trouver le recruteur associé
    const recruiter = await Recruiter.findOne({ user: userId });
    if (!recruiter) {
      return res
        .status(403)
        .json({ message: "Accès refusé. Recruteur requis." });
    }

    // Vérifier que l'annonce appartient bien au recruteur
    const jobPost = await JobPost.findOne({
      _id: id,
      recruiter: recruiter._id,
    });
    if (!jobPost) {
      return res
        .status(404)
        .json({ message: "Annonce introuvable ou non autorisée." });
    }

    await JobPost.deleteOne({ _id: id });
    res.status(200).json({ message: "Annonce supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  createJobPost,
  getMyJobPosts,
  getAllJobPosts,
  getJobPostById,
  deleteJobPost,
};
