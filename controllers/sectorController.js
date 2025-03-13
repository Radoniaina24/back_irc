const Sector = require("../models/sectorModel");
const createSector = async (req, res) => {
  try {
    const { name } = req.body;
    // Vérifier si la Secteur existe déjà
    if (await Sector.findOne({ name })) {
      return res.status(400).json({ message: "Cette Secteur existe déjà" });
    }

    const sector = await Sector.create({ name });
    res.status(201).json({ message: "Secteur créée avec succès", sector });
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const getSectors = async (req, res) => {
  try {
    const sectors = await Sector.find().sort({ createdAt: -1 }); // Tri par date de création décroissante
    res.status(200).json(sectors);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const getSectorById = async (req, res) => {
  try {
    const sector = await Sector.findById(req.params.id);
    if (!sector) {
      return res.status(404).json({ message: "Secteur non trouvée" });
    }
    res.status(200).json(sector);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const updateSector = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const sector = await Sector.findById(id);
    if (!sector) {
      return res.status(404).json({ message: "Secteur non trouvée" });
    }

    // Vérifier si un autre enregistrement a le même nom
    if (name && (await Sector.findOne({ name, _id: { $ne: id } }))) {
      return res
        .status(400)
        .json({ message: "Une autre Secteur porte déjà ce nom" });
    }

    sector.name = name || sector.name;
    await sector.save();
    res
      .status(200)
      .json({ message: "Secteur mise à jour avec succès", sector });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const deleteSector = async (req, res) => {
  try {
    const { id } = req.params;

    const sector = await Sector.findById(id);
    if (!sector) {
      return res.status(404).json({ message: "Secteur non trouvée" });
    }

    await sector.deleteOne();
    res.status(200).json({ message: "Secteur supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
module.exports = {
  createSector,
  getSectors,
  getSectorById,
  updateSector,
  deleteSector,
};
