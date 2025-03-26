const Portfolio = require("../models/portfolioModel");
const Candidate = require("../models/candidateModel");
const cloudinary = require("cloudinary").v2;
// Créer un portfolio
exports.createPortfolio = async (req, res) => {
  if (!req.files) {
    return res
      .status(400)
      .json({ message: "Veuillez télécharger les fichiers requis." });
  }
  const uploadedFiles = {};
  Object.keys(req.files).forEach((key) => {
    uploadedFiles[key] = {
      url: req.files[key][0].path,
      publicId: req.files[key][0].filename,
      type: req.files[key][0].mimetype.startsWith("image/") ? "image" : "pdf",
    };
  });
  const userId = req.user.id; // Récupéré via le middleware d'authentification
  try {
    const { title, role, description, skills, file } = req.body;

    // Vérification de l'existence du candidat
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const newPortfolio = new Portfolio({
      candidate: existingCandidate._id,
      title,
      role,
      description,
      skills,
      file: uploadedFiles.file,
    });

    await newPortfolio.save();
    res.status(201).json(newPortfolio);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Récupérer tous les portfolios d'un candidat
exports.getPortfoliosByCandidate = async (req, res) => {
  const userId = req.user.id; // Récupéré via le middleware d'authentification
  try {
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const portfolios = await Portfolio.find({
      candidate: existingCandidate._id,
    });
    res.status(200).json(portfolios);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Récupérer un portfolio par son ID
exports.getPortfolioById = async (req, res) => {
  const { id } = req.params;
  try {
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mettre à jour un portfolio
exports.updatePortfolio = async (req, res) => {
  const userId = req.user.id; // Récupéré via le middleware d'authentification
  let uploadedFiles = {};
  if (req.files.file) {
    Object.keys(req.files).forEach((key) => {
      uploadedFiles[key] = {
        url: req.files[key][0].path,
        publicId: req.files[key][0].filename,
        type: req.files[key][0].mimetype.startsWith("image/") ? "image" : "pdf",
      };
    });
  }
  try {
    const { id } = req.params;
    const { title, role, description, skills } = req.body;

    // Vérification de l'existence du candidat
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Vérifier que le portfolio appartient au candidat
    const portfolio = await Portfolio.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio entry not found" });
    }

    // Mise à jour du portfolio
    portfolio.title = title || portfolio.title;
    portfolio.role = role || portfolio.role;
    portfolio.description = description || portfolio.description;
    portfolio.skills = skills || portfolio.skills;

    if (req.files.file) {
      await cloudinary.uploader.destroy(portfolio.file.publicId);
      portfolio.file = uploadedFiles.file || portfolio.file;
    }
    const updatedPortfolio = await portfolio.save();
    res.status(200).json(updatedPortfolio);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Supprimer un portfolio
exports.deletePortfolio = async (req, res) => {
  const userId = req.user.id; // Récupéré via le middleware d'authentification

  try {
    const { id } = req.params;

    // Vérification de l'existence du candidat
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Vérifier que le portfolio appartient au candidat
    const portfolio = await Portfolio.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio entry not found" });
    }

    // Suppression du portfolio
    await Portfolio.deleteOne({ _id: id });
    // Suppression du fichier dans cloudinary
    await cloudinary.uploader.destroy(portfolio.file.publicId);
    res.status(200).json({ message: "Portfolio entry successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
