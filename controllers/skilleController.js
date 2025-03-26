const Skill = require("../models/skilleModel");
const Candidate = require("../models/candidateModel");

// Create a skill entry
exports.createSkill = async (req, res) => {
  const userId = req.user.id; // Récupéré via le middleware d'authentification
  try {
    const { skills } = req.body;

    // Vérifier si le candidat existe
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const newSkill = new Skill({
      candidate: existingCandidate._id,
      skills,
    });
    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all skill entries for a candidate
exports.getSkillsByCandidate = async (req, res) => {
  const userId = req.user.id;
  try {
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const skills = await Skill.find({
      candidate: existingCandidate._id,
    });
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a skill entry
exports.updateSkill = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const { skills } = req.body;

    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Vérifier si la compétence appartient au candidat
    const skill = await Skill.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!skill) {
      return res.status(404).json({ message: "Skill entry not found" });
    }

    const updatedSkill = await Skill.findByIdAndUpdate(
      id,
      { skills },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json(updatedSkill);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
