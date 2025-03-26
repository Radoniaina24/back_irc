const express = require("express");
const languageRouter = express.Router();
const languageController = require("../controllers/languageController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");

// Create a language entry
languageRouter.post(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  languageController.createLanguage
);

// Get all language entries for a candidate
languageRouter.get(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  languageController.getLanguagesByCandidate
);

// Update a language entry
languageRouter.put(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  languageController.updateLanguage
);

// Delete a language entry
languageRouter.delete(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  languageController.deleteLanguage
);

module.exports = languageRouter;
