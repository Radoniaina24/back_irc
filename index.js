const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const { globalErrHandler, notFound } = require("./middlewares/globaErrHandler");
const path = require("path");
app.use(cookieParser());
// CORS configuration
// const allowedOrigins = [
//   // "https://international-recruit-agency.vercel.app",
//   "http://localhost:3000", // Ajout de localhost
// ];

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, // Permet d'envoyer des cookies
};
app.use(cors(corsOptions));
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true, // Si tu utilises les cookies ou les sessions
//   })
// );
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

//Gestion des erreurs
app.use(notFound);
app.use(globalErrHandler);
