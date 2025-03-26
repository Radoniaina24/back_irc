const Experience = require("../models/experienceModel");
const Candidate = require("../models/candidateModel");

// Create an experience entry
exports.createExperience = async (req, res) => {
  const userId = req.user.id; // Retrieved via authentication middleware
  try {
    const { company, position, startDate, endDate, description } = req.body;

    // Check if the candidate exists
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const newExperience = new Experience({
      candidate: existingCandidate._id,
      company,
      position,
      startDate,
      endDate,
      description,
    });
    await newExperience.save();
    res.status(201).json(newExperience);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all experience entries for a candidate
exports.getExperiencesByCandidate = async (req, res) => {
  const userId = req.user.id;
  try {
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const experiences = await Experience.find({
      candidate: existingCandidate._id,
    });
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an experience entry
exports.updateExperience = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if the experience belongs to the candidate
    const experience = await Experience.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!experience) {
      return res.status(404).json({ message: "Experience entry not found" });
    }

    const updatedExperience = await Experience.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updatedExperience);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an experience entry
exports.deleteExperience = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if the experience belongs to the candidate
    const experience = await Experience.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!experience) {
      return res.status(404).json({ message: "Experience entry not found" });
    }

    await Experience.deleteOne({ _id: id });
    res.status(200).json({ message: "Experience entry successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
