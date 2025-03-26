const JobPost = require("../models/jobPostModel");
const Recruiter = require("../models/recruiterModel");
const Category = require("../models/categoryModel");
const Sector = require("../models/sectorModel");
const createJobPost = async (req, res) => {
  try {
    const {
      title,
      category,
      sector,
      description,
      location,
      remote,
      contractType,
      experienceRequired,
      studyLevels,
      skills,
      deadline,
    } = req.body;
    const userId = req.user.id; // Récupéré via le middleware d'authentification
    // Vérifier si le secteur existe
    const secteur = await Sector.findById(sector);

    if (!secteur) {
      return res.status(403).json({ message: "This sector does not exist." });
    }
    // Vérifier si le catégorie existe
    const categorie = await Category.findById(category);

    if (!categorie) {
      return res
        .status(403)
        .json({ message: " This category does not exist." });
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
      category: categorie._id,
      sector: secteur._id,
      description,
      location,
      remote,
      contractType,
      experienceRequired,
      studyLevels,
      skills,
      deadline,
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
        .populate("category", "name")
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
    // Récupérer toutes les annonces créées par ce recruteur
    let {
      page = 1,
      limit = 10,
      search,
      categoryId,
      sectorId,
      contractType,
      studyLevels,
      experienceRequired,
    } = req.query;

    // Validation et conversion des paramètres en nombres
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100)); // Limite à 100 max

    // Construction du filtre de recherche
    const filters = {};

    if (search) {
      filters.$or = [{ title: { $regex: search, $options: "i" } }];
    }
    if (categoryId) {
      filters.category = categoryId; // Assurez-vous que 'category' est bien le champ dans votre modèle
    }
    if (sectorId) {
      filters.sector = sectorId; // Assurez-vous que 'sector' est bien le champ dans votre modèle
    }
    if (contractType) {
      filters.contractType = contractType; // Assurez-vous que 'contractType' est bien le champ dans votre modèle
    }
    if (experienceRequired) {
      filters.experienceRequired = experienceRequired; // Assurez-vous que 'experienceRequired' est bien le champ dans votre modèle
    }
    if (studyLevels) {
      const ok = decodeURIComponent(studyLevels).replace(/\+/g, " ");
      console.log(ok);
      filters.studyLevels = studyLevels; //probleme
    }
    // Exécuter les requêtes en parallèle pour améliorer les performances
    const [totalJobPosts, jobPosts] = await Promise.all([
      JobPost.countDocuments(filters),
      JobPost.find(filters)
        .populate("sector", "name")
        .populate({
          path: "recruiter",
          select: "function phone",
          populate: { path: "user", select: "firstName lastName email" },
        })
        .populate("category", "name")
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
const getJobPostById = async (req, res) => {
  try {
    const jobPost = await JobPost.findById(req.params.id).populate("recruiter");
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
      category,
      sector,
      description,
      location,
      remote,
      contractType,
      experienceRequired,
      studyLevels,
      skills,
      deadline,
    } = req.body;
    const userId = req.user.id; // Récupéré via le middleware d'authentification
    // Vérifier si le secteur existe
    const secteur = await Sector.findById(sector);

    if (!secteur) {
      return res.status(403).json({ message: "This sector does not exist." });
    }
    // Vérifier si le catégorie existe
    const categorie = await Category.findById(category);

    if (!categorie) {
      return res.status(403).json({ message: "This category does not exist." });
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
    jobPost.category = categorie._id || jobPost.category;
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
