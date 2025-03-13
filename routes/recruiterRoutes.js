const asyncHandler = require("express-async-handler");
const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");
const recruiterRoutes = express.Router();
const recruiterContollers = require("../controllers/recruiterController");
recruiterRoutes.get(
  "/",
  isLoggedIn,
  checkRole(["admin"]),
  asyncHandler(recruiterContollers.getAllRecruiters)
);
recruiterRoutes.get(
  "/:id",
  isLoggedIn,
  checkRole(["admin", "recruiter"]),
  recruiterContollers.getRecruiterById
);
recruiterRoutes.post(
  "/register",
  asyncHandler(recruiterContollers.createRecruiter)
);
recruiterRoutes.put(
  "/update/:id",
  isLoggedIn,
  checkRole(["admin"]),
  asyncHandler(recruiterContollers.updateRecruiter)
);
recruiterRoutes.put(
  "/update",
  isLoggedIn,
  checkRole(["recruiter"]),
  asyncHandler(recruiterContollers.updateProfilRecruiter)
);
recruiterRoutes.delete(
  "/delete/:id",
  isLoggedIn,
  checkRole(["admin"]),
  recruiterContollers.deleteRecruiter
);
recruiterRoutes.post(
  "/change_password",
  isLoggedIn,
  checkRole(["recruiter"]),
  recruiterContollers.changePassword
);
module.exports = recruiterRoutes;
