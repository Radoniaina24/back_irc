const Application = require("../models/applicationModel");
const JobPost = require("../models/jobPostModel");
const Recruiter = require("../models/recruiterModel");
const Candidate = require("../models/candidateModel");
const cloudinary = require("cloudinary").v2;

const applyToJob = async (req, res) => {
  if (!req.files) {
    return res.status(400).json({
      message: "Please upload the required files.",
    });
  }

  const uploadedFiles = {};
  Object.keys(req.files).forEach((key) => {
    uploadedFiles[key] = {
      url: req.files[key][0].path,
      publicId: req.files[key][0].filename,
      type: req.files[key][0].mimetype.startsWith("image/") ? "image" : "pdf",
    };
  });

  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const userId = req.user.id;

    const candidate = await Candidate.findOne({ user: userId });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    const jobPost = await JobPost.findById(jobId).populate("recruiter");
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found." });
    }

    const existingApplication = await Application.findOne({
      candidate: candidate._id,
      jobPost: jobId,
    });

    if (existingApplication) {
      const resourceType = uploadedFiles.file.type === "pdf" ? "raw" : "image";
      await cloudinary.uploader.destroy(uploadedFiles.file.publicId, {
        resource_type: resourceType,
      });
      return res
        .status(400)
        .json({ message: "You have already applied to this job." });
    }

    const application = new Application({
      candidate: candidate._id,
      jobPost: jobId,
      recruiter: jobPost.recruiter,
      coverLetter,
      file: uploadedFiles.file,
    });

    await application.save();

    res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

const getCandidateApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await Candidate.findOne({ user: userId });

    if (!candidate) {
      return res
        .status(403)
        .json({ message: "Access denied. Candidate access required." });
    }

    let { page = 1, limit = 10, search } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));

    const searchQuery = search
      ? { $or: [{ coverLetter: { $regex: search, $options: "i" } }] }
      : {};

    const [totalJobApplication, jobApplication] = await Promise.all([
      Application.countDocuments({ candidate: candidate._id, ...searchQuery }),
      Application.find({ candidate: candidate._id, ...searchQuery })
        .populate({
          path: "jobPost",
          populate: [{ path: "recruiter" }, { path: "sector" }],
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
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const candidate = await Candidate.findOne({ user: userId });

    if (!candidate) {
      return res
        .status(403)
        .json({ message: "Access denied. Candidate access required." });
    }

    const application = await Application.findOne({
      _id: id,
      candidate: candidate._id,
    });

    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found or unauthorized." });
    }

    await Application.deleteOne({ _id: id });
    res.status(200).json({ message: "Application deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

const getRecruiterApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await Recruiter.findOne({ user: userId });

    if (!recruiter) {
      return res
        .status(403)
        .json({ message: "Access denied. Recruiter access required." });
    }

    let { page = 1, limit = 10, search } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));

    const searchQuery = search
      ? { $or: [{ status: { $regex: search, $options: "i" } }] }
      : {};

    const [totalJobApplication, jobApplication] = await Promise.all([
      Application.countDocuments({ recruiter: recruiter._id, ...searchQuery }),
      Application.find({ recruiter: recruiter._id, ...searchQuery })
        .populate({
          path: "candidate",
          populate: { path: "user", select: "lastName firstName email" },
        })
        .populate({
          path: "jobPost",
          populate: [{ path: "sector", select: "name" }],
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
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

const updateApplicationsById = async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ user: userId });
    if (!recruiter) {
      return res
        .status(403)
        .json({ message: "Access denied. Recruiter access required." });
    }

    const application = await Application.findOne({ recruiter: recruiter._id });
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    application.status = status || application.status;
    await application.save();

    return res
      .status(200)
      .json({ message: "Application updated successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getCandidateApplications,
  deleteApplication,
  getRecruiterApplications,
  updateApplicationsById,
};

module.exports = {
  applyToJob,
  getCandidateApplications,
  deleteApplication,
  getRecruiterApplications,
  updateApplicationsById,
};
