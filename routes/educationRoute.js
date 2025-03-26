const express = require("express");
const educationRouter = express.Router();
const educationController = require("../controllers/educationController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");

// Create an education entry
educationRouter.post(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  educationController.createEducation
);

// Get all education entries for a candidate
educationRouter.get(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  educationController.getEducationsByCandidate
);

// Update an education entry
educationRouter.put(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  educationController.updateEducation
);

// Delete an education entry
educationRouter.delete(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  educationController.deleteEducation
);

module.exports = educationRouter;
