const Education = require("../models/educationModel");
const Candidate = require("../models/candidateModel");

// Create an education entry
exports.createEducation = async (req, res) => {
  const userId = req.user.id; // Récupéré via le middleware d'authentification
  try {
    const { institution, degree, fieldOfStudy, startDate, endDate } = req.body;
    // Check if the candidate exists
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const newEducation = new Education({
      candidate: existingCandidate._id,
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
    });
    await newEducation.save();
    res.status(201).json(newEducation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all education entries for a candidate
exports.getEducationsByCandidate = async (req, res) => {
  const userId = req.user.id; // Récupéré via le middleware d'authentification
  try {
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const educations = await Education.find({
      candidate: existingCandidate._id,
    });
    res.status(200).json(educations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an education entry
exports.updateEducation = async (req, res) => {
  const userId = req.user.id; // Récupéré via le middleware d'authentification

  try {
    const { id } = req.params;
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Vérifier que l'education appartient bien au candidate
    const education = await Education.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!education) {
      return res.status(404).json({ message: "Education entry not found" });
    }

    const updatedEducation = await Education.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updatedEducation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an education entry
exports.deleteEducation = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Vérifier que l'education appartient bien au candidate
    const education = await Education.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!education) {
      return res.status(404).json({ message: "Education entry not found" });
    }

    await Education.deleteOne({ _id: id });

    res.status(200).json({ message: "Education entry successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
