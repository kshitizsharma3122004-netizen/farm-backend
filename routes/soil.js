// backend/routes/soil.js
const express = require("express");
const Data = require("../models/data");

const router = express.Router();

// Normal ranges for soil parameters
const normalRanges = {
  ph: { min: 6.0, max: 7.5 },
  moisture: { min: 20, max: 60 },
  N: { min: 10, max: 50 },
  P: { min: 5, max: 30 },
  K: { min: 10, max: 40 },
};

// GET /api/soil (tokenless, safe)
router.get("/", async (req, res) => {
  try {
    console.log("Received GET /api/soil request");

    // Fetch all data, newest first
    const allData = await Data.find().sort({ createdAt: -1 });
    console.log("Fetched entries:", allData.length);

    const enrichedData = allData.map((entry) => {
      // Ensure sensorReadings exists
      const sensorReadings = entry.sensorReadings || { ph: null, moisture: null, N: null, P: null, K: null };

      const states = {};
      for (let key of ["ph", "moisture", "N", "P", "K"]) {
        const val = sensorReadings[key];
        if (val == null) states[key] = "null";
        else if (val < normalRanges[key].min) states[key] = "Low";
        else if (val > normalRanges[key].max) states[key] = "High";
        else states[key] = "Normal";
      }

      // General state logic: High > Low > Normal
      const counts = { Low: 0, Normal: 0, High: 0 };
      for (const s of Object.values(states)) if (s in counts) counts[s]++;
      const generalState = counts.High > 0 ? "High" : counts.Low > 0 ? "Low" : "Normal";

      return {
        _id: entry._id,
        sensorReadings,
        states,
        generalState,
        createdAt: entry.createdAt,
      };
    });

    res.json(enrichedData);
  } catch (err) {
    console.error("Error fetching soil data:", err);
    res.status(500).json({ error: "Failed to fetch soil data" });
  }
});

module.exports = router;
