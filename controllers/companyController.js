const Company = require("../models/companyModel");
const Recruiter = require("../models/recruiterModel");
const updateCompany = async (req, res) => {
  try {
    const {
      companyName,
      industry,
      companySize,
      address,
      city,
      country,
      website,
    } = req.body;
    const userId = req.user.id; // ID de l'utilisateur connecté

    // Vérifier si l'utilisateur est un recruteur
    const recruiter = await Recruiter.findOne({ user: userId });

    if (!recruiter) {
      return res
        .status(403)
        .json({ message: "Accès refusé. Recruteur requis." });
    }
    // Vérifier si l'entreprise existe et appartient au recruteur
    const company = await Company.findOne({ recruiter: recruiter._id });
    if (!company) {
      const company = new Company({
        companyName,
        industry,
        companySize,
        address,
        city,
        country,
        website,
        recruiter: recruiter._id,
      });
      await company.save();
      return res.status(200).json({ company });
    }
    // Mettre à jour les informations
    company.companyName = companyName || company.companyName;
    company.industry = industry || company.industry;
    company.companySize = companySize || company.companySize;
    company.address = address || company.address;
    company.city = city || company.city;
    company.country = country || company.country;
    company.website = website || company.website;
    await company.save();

    res
      .status(200)
      .json({ message: "Entreprise mise à jour avec succès", company });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};
const getMyCompany = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur connecté

    // Vérifier si l'utilisateur est un recruteur
    const recruiter = await Recruiter.findOne({ user: userId });

    if (!recruiter) {
      return res
        .status(403)
        .json({ message: "Accès refusé. Recruteur requis." });
    }
    const company = await Company.findOne({ recruiter: recruiter._id });
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};
module.exports = { updateCompany, getMyCompany };
