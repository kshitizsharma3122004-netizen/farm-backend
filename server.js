const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth");
const DataRoutes = require("./routes/Data");
const analysisRoutes = require("./routes/analysis");
const weatherRoute = require("./routes/weather");
const soilRoute = require("./routes/soil");
const citiesRoute = require("./routes/cities"); // ✅ new

dotenv.config();
connectDB();

const app = express();

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(cors());

// ---------- SERVE UPLOADS ----------
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
// This allows frontend or Python script to access uploaded images

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/data", DataRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/weather", weatherRoute);
app.use("/api/soil", soilRoute);
app.use("/api/cities", citiesRoute);

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
