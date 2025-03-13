const Application = require("../models/applicationModel");
const JobPost = require("../models/jobPostModel");
const Recruiter = require("../models/recruiterModel");

const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const candidateId = req.user.id;

    // Vérifier si l'annonce existe
    const jobPost = await JobPost.findById(jobId).populate("recruiter");
    if (!jobPost) {
      return res.status(404).json({ message: "Annonce introuvable." });
    }

    // Vérifier si le candidat a déjà postulé
    const existingApplication = await Application.findOne({
      candidate: candidateId,
      jobPost: jobId,
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "Vous avez déjà postulé à cette annonce." });
    }

    // Créer une nouvelle candidature
    const application = new Application({
      candidate: candidateId,
      jobPost: jobId,
      recruiter: jobPost.recruiter,
      coverLetter,
    });

    await application.save();
    res
      .status(201)
      .json({ message: "Candidature envoyée avec succès.", application });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
const getCandidateApplications = async (req, res) => {
  try {
    const candidateId = req.user.id;
    // Récupérer toutes les candidature du candidat
    let { page = 1, limit = 10, search } = req.query;
    // Validation et conversion des paramètres en nombres
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100)); // Limite à 100 max
    const searchQuery = search
      ? { $or: [{ coverLetter: { $regex: search, $options: "i" } }] }
      : {};
    // Exécuter les requêtes en parallèle pour améliorer les performances
    const [totalJobApplication, jobApplication] = await Promise.all([
      Application.countDocuments({ candidate: candidateId, ...searchQuery }),
      Application.find({ candidate: candidateId, ...searchQuery })
        .populate({
          path: "jobPost",
          populate: { path: "recruiter" },
          populate: { path: "category" },
        })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    const totalPages = Math.ceil(totalJobApplication / limit);
    res.status(200).json({
      success: true,
      totalJobApplication,
      totalPages,
      currentPage: page,
      jobApplication,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
const deleteApplication = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { id } = req.params;

    // Vérifier si la candidature existe et appartient au candidat
    const application = await Application.findOne({
      _id: id,
      candidate: candidateId,
    });

    if (!application) {
      return res
        .status(404)
        .json({ message: "Candidature introuvable ou non autorisée." });
    }

    await Application.deleteOne({ _id: id });
    res.status(200).json({ message: "Candidature supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
const getRecruiterApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    // Vérifier que l'utilisateur est un recruteur
    const recruiter = await Recruiter.findOne({ user: userId });
    if (!recruiter) {
      return res
        .status(403)
        .json({ message: "Accès refusé. Recruteur requis." });
    }

    // Récupérer toutes les candidatures pour les annonces du recruteur
    const applications = await Application.find({ recruiter: recruiter._id })
      .populate("candidate", "firstName lastName email")
      .populate("jobPost", "title");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  applyToJob,
  getCandidateApplications,
  deleteApplication,
  getRecruiterApplications,
};
