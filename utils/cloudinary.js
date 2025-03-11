const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration de Multer avec stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Extraire le nom original du fichier sans l'extension
    const originalName = file.originalname
      .split(".")
      .slice(0, -1)
      .join("_")
      .replace(/\s+/g, "_");

    // Récupérer la date du jour (format YYYYMMDD)
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");

    const isImage = file.mimetype.startsWith("image/");
    const isPdf = file.mimetype === "application/pdf";

    let options = {
      folder: isImage ? "profil_student" : "pdfs_student",
      public_id: `${originalName}_${currentDate}`,
    };

    if (isImage) {
      options.format = "jpg"; // Convertit toutes les images en JPG
    } else if (isPdf) {
      options.resource_type = "raw"; // Définit les PDFs comme fichiers bruts
      options.format = "pdf"; // Supprime l'attribut format pour les PDFs
    }
    return options;
  },
});

// Initialisation de l'upload avec multer
const upload = multer({ storage: storage });
const uploadStudentPhoto = upload.single("photo");
const uploadFileStudent = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "last_degree", maxCount: 1 },
  { name: "residence_certificate", maxCount: 1 },
  { name: "transcript", maxCount: 1 },
]);
module.exports = {
  uploadStudentPhoto,
  uploadFileStudent,
};
