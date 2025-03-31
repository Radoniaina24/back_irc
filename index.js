const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const { globalErrHandler, notFound } = require("./middlewares/globaErrHandler");
const path = require("path");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: "https://international-recruit-agency.vercel.app",
  credentials: true, // Permet d'envoyer des cookies
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
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
const companyRoutes = require("./routes/companyRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const sectorRoutes = require("./routes/sectorRoutes");
const educationRoutes = require("./routes/educationRoute");
const experienceRoutes = require("./routes/experienceRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const languageRoutes = require("./routes/languageRoutes");
const skilleRoutes = require("./routes/skilleRoutes");
const portfolioRoutes = require("./routes/portfolio");
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
app.use("/api/company", companyRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/sector", sectorRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/certification", certificationRoutes);
app.use("/api/language", languageRoutes);
app.use("/api/skille", skilleRoutes);
app.use("/api/portfolio", portfolioRoutes);

//Gestion des erreurs
app.use(notFound);
app.use(globalErrHandler);
