const express = require("express");
const portfolioRouter = express.Router();
const portfolioController = require("../controllers/portfolioController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");

// Créer un portfolio
portfolioRouter.post(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
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
