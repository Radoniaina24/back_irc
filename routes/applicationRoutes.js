const asyncHandler = require("express-async-handler");
const express = require("express");
const applicationRoutes = express.Router();
const applicationContollers = require("../controllers/appicationController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");
const { uploadFile } = require("../utils/cloudinary");
applicationRoutes.post(
  "/:jobId",
  isLoggedIn,
  checkRole(["candidate"]),
  uploadFile,
  asyncHandler(applicationContollers.applyToJob)
);
applicationRoutes.get(
  "/candidate_application",
  isLoggedIn,
  checkRole(["candidate"]),
  asyncHandler(applicationContollers.getCandidateApplications)
);
applicationRoutes.delete(
  "/delete/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  asyncHandler(applicationContollers.deleteApplication)
);
applicationRoutes.get(
  "/recruiter_application",
  isLoggedIn,
  checkRole(["recruiter"]),
  asyncHandler(applicationContollers.getRecruiterApplications)
);
applicationRoutes.put(
  "/update/:id",
  isLoggedIn,
  checkRole(["recruiter"]),
  asyncHandler(applicationContollers.updateApplicationsById)
);
module.exports = applicationRoutes;
