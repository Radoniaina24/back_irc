const asyncHandler = require("express-async-handler");
const express = require("express");
const companyRoutes = express.Router();
const companyController = require("../controllers/companyController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");

companyRoutes.get(
  "/my_company",
  isLoggedIn,
  checkRole(["recruiter"]),
  asyncHandler(companyController.getMyCompany)
);

companyRoutes.put(
  "/update",
  isLoggedIn,
  checkRole(["recruiter"]),
  asyncHandler(companyController.updateCompany)
);
module.exports = companyRoutes;
