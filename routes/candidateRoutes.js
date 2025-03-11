const asyncHandler = require("express-async-handler");
const express = require("express");
const candidateRoutes = express.Router();
const candidateController = require("../controllers/CandidateController");
candidateRoutes.get("/", asyncHandler(candidateController.getAllCandidates));
candidateRoutes.get("/:id", candidateController.getCandidateById);
candidateRoutes.post(
  "/register",
  asyncHandler(candidateController.createCandidate)
);
candidateRoutes.put(
  "/update/:id",
  asyncHandler(candidateController.updateCandidate)
);
candidateRoutes.delete("/delete/:id", candidateController.deleteCandidate);
module.exports = candidateRoutes;
