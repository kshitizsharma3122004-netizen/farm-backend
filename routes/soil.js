const express = require("express");
const router = express.Router();

// Normal ranges for soil parameters
const normalRanges = {
  ph: { min: 6.0, max: 7.5 },
  moisture: { min: 20, max: 60 },
  N: { min: 10, max: 50 },
  P: { min: 5, max: 30 },
  K: { min: 10, max: 40 },
};

// In-memory soil data
let soilData = [
  {
    _id: 1,
    sensorReadings: { ph: 7, moisture: 45, N: 20, P: 10, K: 25 },
    createdAt: new Date(),
  },
  {
    _id: 2,
    sensorReadings: { ph: 5.5, moisture: 15, N: 5, P: 3, K: 8 },
    createdAt: new Date(),
  },
];

// GET /api/soil
router.get("/", (req, res) => {
  const enrichedData = soilData.map((entry) => {
    const sensorReadings = entry.sensorReadings;
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
    Object.values(states).forEach((s) => counts[s] !== undefined && counts[s]++);
    const generalState = counts.High > 0 ? "High" : counts.Low > 0 ? "Low" : "Normal";

    return { ...entry, states, generalState };
  });

  res.json(enrichedData);
});

// POST /api/soil to add new readings
router.post("/", (req, res) => {
  const { ph, moisture, N, P, K } = req.body;
  const newEntry = {
    _id: soilData.length + 1,
    sensorReadings: { ph, moisture, N, P, K },
    createdAt: new Date(),
  };
  soilData.unshift(newEntry); // add to start
  res.json({ message: "New reading added", entry: newEntry });
});

module.exports = router;
