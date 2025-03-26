const Language = require("../models/languageModel");
const Candidate = require("../models/candidateModel");

// Create a language entry
exports.createLanguage = async (req, res) => {
  const userId = req.user.id; // Récupéré via le middleware d'authentification
  try {
    const { language, proficiency } = req.body;

    // Vérifier si le candidat existe
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const newLanguage = new Language({
      candidate: existingCandidate._id,
      language,
      proficiency,
    });
    await newLanguage.save();
    res.status(201).json(newLanguage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all language entries for a candidate
exports.getLanguagesByCandidate = async (req, res) => {
  const userId = req.user.id;
  try {
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const languages = await Language.find({
      candidate: existingCandidate._id,
    });
    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a language entry
exports.updateLanguage = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Vérifier si la langue appartient au candidat
    const language = await Language.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!language) {
      return res.status(404).json({ message: "Language entry not found" });
    }

    const updatedLanguage = await Language.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updatedLanguage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a language entry
exports.deleteLanguage = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Vérifier si la langue appartient au candidat
    const language = await Language.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!language) {
      return res.status(404).json({ message: "Language entry not found" });
    }

    await Language.deleteOne({ _id: id });
    res.status(200).json({ message: "Language entry successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
