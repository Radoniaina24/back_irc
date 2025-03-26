const Certification = require("../models/certificationModel");
const Candidate = require("../models/candidateModel");

// Create a certification entry
exports.createCertification = async (req, res) => {
  const userId = req.user.id; // Retrieved via authentication middleware
  try {
    const { name, issuingOrganization, dateObtained } = req.body;

    // Check if the candidate exists
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const newCertification = new Certification({
      candidate: existingCandidate._id,
      name,
      issuingOrganization,
      dateObtained,
    });
    await newCertification.save();
    res.status(201).json(newCertification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all certification entries for a candidate
exports.getCertificationsByCandidate = async (req, res) => {
  const userId = req.user.id;
  try {
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const certifications = await Certification.find({
      candidate: existingCandidate._id,
    });
    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a certification entry
exports.updateCertification = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if the certification belongs to the candidate
    const certification = await Certification.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!certification) {
      return res.status(404).json({ message: "Certification entry not found" });
    }

    const updatedCertification = await Certification.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json(updatedCertification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a certification entry
exports.deleteCertification = async (req, res) => {
  const userId = req.user.id;
  try {
    const { id } = req.params;
    const existingCandidate = await Candidate.findOne({ user: userId });
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if the certification belongs to the candidate
    const certification = await Certification.findOne({
      _id: id,
      candidate: existingCandidate._id,
    });
    if (!certification) {
      return res.status(404).json({ message: "Certification entry not found" });
    }

    await Certification.deleteOne({ _id: id });
    res
      .status(200)
      .json({ message: "Certification entry successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
