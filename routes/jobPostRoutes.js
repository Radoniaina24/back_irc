const asyncHandler = require("express-async-handler");
const express = require("express");
const jobPostRoutes = express.Router();
const jobPostContollers = require("../controllers/jobPostController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");
jobPostRoutes.post(
  "/register",
  isLoggedIn,
  checkRole(["recruiter"]),
  asyncHandler(jobPostContollers.createJobPost)
);
jobPostRoutes.get(
  "/my_jobPost",
  isLoggedIn,
  checkRole(["recruiter"]),
  asyncHandler(jobPostContollers.getMyJobPosts)
);
jobPostRoutes.delete(
  "/delete/:id",
  isLoggedIn,
  checkRole(["recruiter"]),
  asyncHandler(jobPostContollers.deleteJobPost)
);
jobPostRoutes.put(
  "/update/:id",
  isLoggedIn,
  checkRole(["recruiter"]),
  asyncHandler(jobPostContollers.updateJobPost)
);
jobPostRoutes.put(
  "/update-by-admin/:id",
  isLoggedIn,
  checkRole(["admin"]),
  asyncHandler(jobPostContollers.updateJobPostByStatus)
);
jobPostRoutes.get("/:id", asyncHandler(jobPostContollers.getJobPostById));
jobPostRoutes.get("/", asyncHandler(jobPostContollers.getAllJobPosts));
module.exports = jobPostRoutes;
