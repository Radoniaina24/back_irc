const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const { globalErrHandler, notFound } = require("./middlewares/globaErrHandler");
const path = require("path");
app.use(cookieParser());
// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  // "https://front-school-managment.vercel.app" || "http://localhost:3000", // Autoriser le frontend à accéder à l'API
  credentials: true, // Permet d'envoyer des cookies
};
app.use(cors(corsOptions));
require("dotenv").config();
const dbConnect = require("./config/dbConnect");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const jobPostRoutes = require("./routes/jobPostRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const port = process.env.PORT;
dbConnect();
app.use(express.json());
// ***********//
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
//routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/job-posts", jobPostRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/application", applicationRoutes);

//Gestion des erreurs
app.use(notFound);
app.use(globalErrHandler);
