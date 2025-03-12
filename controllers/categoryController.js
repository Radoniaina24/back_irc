const Category = require("../models/categoryModel");

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Vérifier si la catégorie existe déjà
    if (await Category.findOne({ name })) {
      return res.status(400).json({ message: "Cette catégorie existe déjà" });
    }

    const category = await Category.create({ name });
    res.status(201).json({ message: "Catégorie créée avec succès", category });
  } catch (error) {
    console.error("Erreur lors de la création :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }); // Tri par date de création décroissante
    res.status(200).json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
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
    const { name } = req.body;
    const { id } = req.params;

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
