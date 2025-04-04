const JobPost = require("../models/jobPostModel");
const Recruiter = require("../models/recruiterModel");
const Sector = require("../models/sectorModel");
const createJobPost = async (req, res) => {
  try {
    const {
      title,
      sector,
      description,
      location,
      remote,
      contractType,
      experienceRequired,
      studyLevels,
      skills,
      deadline,
      candidate_profil,
      missions,
    } = req.body;
    const userId = req.user.id; // Récupéré via le middleware d'authentification
    // Vérifier si le secteur existe
    const secteur = await Sector.findById(sector);

    if (!secteur) {
      return res.status(403).json({ message: "This sector does not exist." });
    }

    // Vérifier si l'utilisateur est un recruteur
    const recruiter = await Recruiter.findOne({ user: userId });

    if (!recruiter) {
      return res
        .status(403)
        .json({ message: " Access denied. Recruiter required." });
    }
    // Créer et enregistrer l'annonce
    const jobPost = new JobPost({
      title,
      recruiter: recruiter._id,
      sector: secteur._id,
      description,
      location,
      remote,
      contractType,
      experienceRequired,
      studyLevels,
      skills,
      deadline,
      candidate_profil,
      missions,
    });
    await jobPost.save();
    res.status(201).json({ message: "Ad created successfully.", jobPost });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
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
        .json({ message: "Access denied. Recruiter required." });
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
        .populate("sector", "name")
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
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
const getAllJobPosts = async (req, res) => {
  try {
    // Récupération et validation des paramètres de requête
    let {
      page = 1,
      limit = 10,
      search,
      sectorId,
      contractType,
      experienceRequired,
      studyLevels,
    } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100)); // Limite max à 100

    // Construction dynamique des filtres
    const filters = {};

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        // Tu peux ajouter d'autres champs ici si nécessaire
      ];
    }

    if (sectorId) {
      filters.sector = sectorId;
    }

    if (contractType) {
      const contractTypesArray = Array.isArray(contractType)
        ? contractType
        : contractType.split(",");
      filters.contractType = { $in: contractTypesArray };
    }

    if (experienceRequired) {
      const experienceArray = Array.isArray(experienceRequired)
        ? experienceRequired
        : experienceRequired.split(",");
      filters.experienceRequired = { $in: experienceArray };
    }

    if (studyLevels) {
      const studyLevelsArray = Array.isArray(studyLevels)
        ? studyLevels
        : studyLevels.split(",");
      filters.studyLevels = { $in: studyLevelsArray };
    }

    // Calcul du nombre total d'annonces correspondant aux filtres
    const totalJobPosts = await JobPost.countDocuments(filters);

    // Calcul du nombre total de pages
    const totalPages = Math.ceil(totalJobPosts / limit);

    // Si page demandée est au-delà du nombre de pages existant, on la ramène à la dernière page
    // ⚠️ Si la page demandée dépasse le totalPages => revenir à la page 1
    const currentPage = totalPages > 0 && page > totalPages ? 1 : page;

    // Récupération paginée des annonces
    const jobPosts = await JobPost.find(filters)
      .populate("sector", "name")
      .populate({
        path: "recruiter",
        select: "companyName",
        populate: {
          path: "user",
          select: "firstName lastName email",
        },
      })
      .skip((currentPage - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      totalJobPosts,
      totalPages,
      currentPage,
      jobPosts,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue sur le serveur.",
      error: error.message,
    });
  }
};

const getJobPostById = async (req, res) => {
  try {
    const jobPost = await JobPost.findById(req.params.id)
      .populate("sector", "name")
      .populate({
        path: "recruiter",
        select: "companyName",
        populate: { path: "user", select: "firstName lastName email" },
      });
    if (!jobPost) return res.status(404).json({ message: "Ad not found." });
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
        .json({ message: "Access denied. Recruiter required." });
    }

    // Vérifier que l'annonce appartient bien au recruteur
    const jobPost = await JobPost.findOne({
      _id: id,
      recruiter: recruiter._id,
    });
    if (!jobPost) {
      return res.status(404).json({ message: "Ad not found or unauthorized." });
    }

    await JobPost.deleteOne({ _id: id });
    res.status(200).json({ message: "Ad deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
const updateJobPost = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,

      sector,
      description,
      location,
      remote,
      contractType,
      experienceRequired,
      studyLevels,
      skills,
      deadline,
      candidate_profil,
      missions,
    } = req.body;
    const userId = req.user.id; // Récupéré via le middleware d'authentification
    // Vérifier si le secteur existe
    const secteur = await Sector.findById(sector);

    if (!secteur) {
      return res.status(403).json({ message: "This sector does not exist." });
    }
    // Trouver le recruteur associé
    const recruiter = await Recruiter.findOne({ user: userId });
    if (!recruiter) {
      return res
        .status(403)
        .json({ message: "Access denied. Recruiter required." });
    }

    // Vérifier que l'annonce appartient bien au recruteur
    const jobPost = await JobPost.findOne({
      _id: id,
      recruiter: recruiter._id,
    });
    if (!jobPost) {
      return res.status(404).json({ message: "Ad not found or unauthorized." });
    }

    // Mise à jour des champs fournis
    jobPost.title = title || jobPost.title;
    jobPost.sector = secteur._id || jobPost.sector;
    jobPost.description = description || jobPost.description;
    jobPost.location = location || jobPost.location;
    jobPost.contractType = contractType || jobPost.contractType;
    jobPost.experienceRequired =
      experienceRequired || jobPost.experienceRequired;
    jobPost.studyLevels = studyLevels || jobPost.studyLevels;
    jobPost.skills = skills || jobPost.skills;
    jobPost.deadline = deadline || jobPost.deadline;
    jobPost.remote = remote || jobPost.remote;
    jobPost.candidate_profil = candidate_profil || jobPost.candidate_profil;
    jobPost.missions = missions || jobPost.missions;

    await jobPost.save();
    res.status(200).json({ message: "Ad updated successfully.", jobPost });
  } catch (error) {
    res.status(500).json({ message: " Server error.", error: error.message });
  }
};
const updateJobPostByStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { permissions } = req.body;
    // Vérifier que l'annonce existe
    const jobPost = await JobPost.findOne({
      _id: id,
    });
    if (!jobPost) {
      return res.status(404).json({ message: "Ad not found." });
    }
    // Mise à jour des champs fournis
    jobPost.permissions = permissions || jobPost.permissions;
    await jobPost.save();
    res.status(200).json({ message: "Ad updated successfully.", jobPost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  createJobPost,
  getMyJobPosts,
  getAllJobPosts,
  getJobPostById,
  deleteJobPost,
  updateJobPost,
  updateJobPostByStatus,
};
