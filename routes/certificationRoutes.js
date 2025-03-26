const express = require("express");
const certificationRouter = express.Router();
const certificationController = require("../controllers/certificationController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");

// Create a certification entry
certificationRouter.post(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  certificationController.createCertification
);

// Get all certification entries for a candidate
certificationRouter.get(
  "/",
  isLoggedIn,
  checkRole(["candidate"]),
  certificationController.getCertificationsByCandidate
);

// Update a certification entry
certificationRouter.put(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  certificationController.updateCertification
);

// Delete a certification entry
certificationRouter.delete(
  "/:id",
  isLoggedIn,
  checkRole(["candidate"]),
  certificationController.deleteCertification
);

module.exports = certificationRouter;
