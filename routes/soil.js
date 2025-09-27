// backend/routes/soil.js
const express = require("express");
const Data = require("../models/data");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Normal ranges for soil parameters
const normalRanges = {
  ph: { min: 6.0, max: 7.5 },
  moisture: { min: 20, max: 60 },
  N: { min: 10, max: 50 },
  P: { min: 5, max: 30 },
  K: { min: 10, max: 40 },
};

// GET /api/soil
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all data for this user, sorted by newest first
    const userData = await Data.find({ userId }).sort({ createdAt: -1 });

    // Add "state" for each reading
    const enrichedData = userData.map((entry) => {
      const states = {};
      for (let key of ["ph", "moisture", "N", "P", "K"]) {
        const val = entry.sensorReadings[key];
        if (val == null) {
          states[key] = "null";
        } else if (val < normalRanges[key].min) {
          states[key] = "Low";
        } else if (val > normalRanges[key].max) {
          states[key] = "High";
        } else {
          states[key] = "Normal";
        }
      }
      return {
        _id: entry._id,
        sensorReadings: entry.sensorReadings,
        states,
        createdAt: entry.createdAt,
      };
    });

    res.json(enrichedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch soil data" });
  }
});

module.exports = router;
