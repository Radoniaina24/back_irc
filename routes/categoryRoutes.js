const express = require("express");
const categoryRouter = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");
categoryRouter.post("/", isLoggedIn, checkRole(["admin"]), createCategory);
categoryRouter.get("/", isLoggedIn, getCategories);
categoryRouter.get("/:id", isLoggedIn, getCategoryById);
categoryRouter.put("/:id", isLoggedIn, checkRole(["admin"]), updateCategory);
categoryRouter.delete("/:id", isLoggedIn, checkRole(["admin"]), deleteCategory);

module.exports = categoryRouter;
