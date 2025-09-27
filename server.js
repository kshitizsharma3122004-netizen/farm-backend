const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const DataRoutes = require("./routes/Data");
const analysisRoutes = require("./routes/analysis");
const weatherRoute = require("./routes/weather.js");
const soilRoute = require("./routes/soil");

dotenv.config();
// connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/data", DataRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/weather", weatherRoute);
app.use("/api/soil", soilRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
