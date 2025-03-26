const express = require("express");
const portfolioRouter = express.Router();
const portfolioController = require("../controllers/portfolioController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");
const { uploadFile } = require("../utils/cloudinary");

// Créer un portfolio
portfolioRouter.post(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  uploadFile,
  portfolioController.createPortfolio
);

// Obtenir tous les portfolios d'un candidat
portfolioRouter.get(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  portfolioController.getPortfoliosByCandidate
);

// Obtenir un portfolio par ID
portfolioRouter.get(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  portfolioController.getPortfolioById
);

// Mettre à jour un portfolio
portfolioRouter.put(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  uploadFile,
  portfolioController.updatePortfolio
);

// Supprimer un portfolio
portfolioRouter.delete(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  portfolioController.deletePortfolio
);

module.exports = portfolioRouter;
