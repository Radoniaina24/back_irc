const asyncHandler = require("express-async-handler");
const express = require("express");
const recruiterRoutes = express.Router();
const recruiterContollers = require("../controllers/recruiterController");
recruiterRoutes.get("/", asyncHandler(recruiterContollers.getAllRecruiters));
recruiterRoutes.get("/:id", recruiterContollers.getRecruiterById);
recruiterRoutes.post(
  "/register",
  asyncHandler(recruiterContollers.createRecruiter)
);
recruiterRoutes.put(
  "/update/:id",
  asyncHandler(recruiterContollers.updateRecruiter)
);
recruiterRoutes.delete("/delete/:id", recruiterContollers.deleteRecruiter);
module.exports = recruiterRoutes;
