const asyncHandler = require("express-async-handler");
const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");
const candidateRoutes = express.Router();
const candidateController = require("../controllers/CandidateController");
candidateRoutes.get(
  "/permission",
  isLoggedIn,
  checkRole(["candidate", "admin"]),
  candidateController.getPermission
);
candidateRoutes.get(
  "/my-profile",
  isLoggedIn,
  checkRole(["candidate"]),
  candidateController.getMe
);
candidateRoutes.get(
  "/",
  isLoggedIn,
  checkRole(["admin"]),
  asyncHandler(candidateController.getAllCandidates)
);
candidateRoutes.get(
  "/:id",
  isLoggedIn,
  checkRole(["admin"]),
  candidateController.getCandidateById
);
candidateRoutes.post(
  "/register",
  asyncHandler(candidateController.createCandidate)
);
candidateRoutes.put(
  "/update/:id",
  isLoggedIn,
  checkRole(["admin", "candidate"]),
  asyncHandler(candidateController.updateCandidate)
);
candidateRoutes.delete(
  "/delete/:id",
  isLoggedIn,
  checkRole(["admin"]),
  candidateController.deleteCandidate
);
candidateRoutes.post(
  "/change_password",
  isLoggedIn,
  checkRole(["candidate"]),
  candidateController.changePassword
);

module.exports = candidateRoutes;
