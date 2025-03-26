const express = require("express");
const experienceRouter = express.Router();
const experienceController = require("../controllers/experienceController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");

// Create an experience entry
experienceRouter.post(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  experienceController.createExperience
);

// Get all experience entries for a candidate
experienceRouter.get(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  experienceController.getExperiencesByCandidate
);

// Update an experience entry
experienceRouter.put(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  experienceController.updateExperience
);

// Delete an experience entry
experienceRouter.delete(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  experienceController.deleteExperience
);

module.exports = experienceRouter;
