const User = require("../models/userModel");
const verifyToken = require("../utils/verifyToken");
const bcrypt = require("bcrypt");
const { generateRefreshToken } = require("../utils/generateToken");
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Vérifier si les champs sont bien remplis
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // Trouver l'utilisateur et inclure explicitement le champ `password`
    const userFound = await User.findOne({ email }).select("+password");

    if (!userFound) {
      return res.status(404).json({ message: "Incorrect password or email" });
    }
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password or email" });
    }
    const refreshToken = generateRefreshToken(userFound._id);
    userFound.refreshToken = refreshToken;
    await userFound.save(); // ⚠️ Toujours attendre la sauvegarde

    // Ajouter le token dans un cookie HttpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true en prod, false en dev
      sameSite: "Strict", // Permet d'envoyer le cookie même en cross-origin
      maxAge: 3600000, // 1 heure
    });
    res.json({
      status: "success",
      message: "User logged in successfully",
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const user = req.user; // Injecté par le middleware `isLoggedIn`
  // console.log("user", user);
  res.status(200).json({
    user,
    token: user.refreshToken,
  });
}

async function logout(req, res) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Utiliser HTTPS en production
    sameSite: "Strict", // Pour éviter le CSRF
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Utiliser HTTPS en production
    sameSite: "Strict", // Pour éviter le CSRF
  });
  res.json({ message: "User logged out successfully" });
}
async function refreshAccessToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(403).json({ message: "Non autorisé" });

    const decoded = verifyToken(refreshToken);
    const newAccessToken = generateRefreshToken(decoded.id);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // Durée du Refresh Token (7 jours)
    });
    res
      .status(200)
      .json({ message: "Token successfully refreshed", newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  getMe,
  login,
  logout,
  refreshAccessToken,
};
