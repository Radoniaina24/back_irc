const Category = require("../models/categoryModel");
const Sector = require("../models/sectorModel");
const createCategory = async (req, res) => {
  try {
    const { name, sector } = req.body;
    // Vérifier si le catégorie existe
    const secteur = await Sector.findById(sector);

    if (!secteur) {
      return res.status(403).json({ message: "Secteur  non trouvée" });
    }
    // Vérifier si la catégorie existe déjà
    if (await Category.findOne({ name })) {
      return res.status(400).json({ message: "Cette catégorie existe déjà" });
    }
    const category = new Category({ name, sector: secteur._id });
    await category.save();
    res.status(201).json({ message: "Catégorie créée avec succès", category });
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const searchQuery = search
      ? {
          name: { $regex: search, $options: "i" }, // Supposons que "name" soit le champ à rechercher
        }
      : {};
    const totalCategories = await Category.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCategories / limit);
    const categories = await Category.find(searchQuery)
      .sort({ createdAt: -1 })
      .populate("sector", "name")
      .skip((page - 1) * limit)
      .limit(limit); // Tri par date de création décroissante
    res.status(200).json({
      status: "success",
      totalCategories,
      totalPages,
      currentPage: parseInt(page),
      categories,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "sector",
      "name"
    );
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const updateCategory = async (req, res) => {
  try {
    const { name, sector } = req.body;
    const { id } = req.params;
    //verification si le secteur existe
    const secteur = await Sector.findById(sector);
    if (!secteur) {
      return res.status(403).json({ message: "Secteur  non trouvée" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    // Vérifier si un autre enregistrement a le même nom
    if (name && (await Category.findOne({ name, _id: { $ne: id } }))) {
      return res
        .status(400)
        .json({ message: "Une autre catégorie porte déjà ce nom" });
    }

    category.name = name || category.name;
    category.sector = secteur._id || category.sector;
    await category.save();
    res
      .status(200)
      .json({ message: "Catégorie mise à jour avec succès", category });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    await category.deleteOne();
    res.status(200).json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
