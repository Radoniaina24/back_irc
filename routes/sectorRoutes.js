const express = require("express");
const sectorRouter = express.Router();
const {
  createSector,
  getSectors,
  getSectorById,
  updateSector,
  deleteSector,
} = require("../controllers/sectorController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const checkRole = require("../middlewares/checkRole");
sectorRouter.post("/", isLoggedIn, checkRole(["admin"]), createSector);
sectorRouter.get("/", getSectors);
sectorRouter.get("/:id", getSectorById);
sectorRouter.put("/:id", isLoggedIn, checkRole(["admin"]), updateSector);
sectorRouter.delete("/:id", isLoggedIn, checkRole(["admin"]), deleteSector);

module.exports = sectorRouter;
