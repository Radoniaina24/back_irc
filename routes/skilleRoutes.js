const express = require("express");
const skillRouter = express.Router();
const skillController = require("../controllers/skilleController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");

// Create a skill entry
skillRouter.post(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  skillController.createSkill
);

// Get all skill entries for a candidate
skillRouter.get(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  skillController.getSkillsByCandidate
);
// Update a skill entry
skillRouter.put(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  skillController.updateSkill
);
module.exports = skillRouter;
