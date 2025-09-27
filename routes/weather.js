// backend/routes/weather.js
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config(); // ✅ Load .env variables

const router = express.Router();
const API_KEY = process.env.WEATHER_API_KEY;

// Debug: make sure API key is loaded
if (!API_KEY) {
  console.error("⚠️ WEATHER_API_KEY is missing in .env");
}

// GET /api/weather?location=Delhi
router.get("/", async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "Weather API key is missing" });
    }

    // Call OpenWeather 5-day forecast API
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          q: location,
          appid: API_KEY,
          units: "metric",
        },
      }
    );

    // Extract 1 forecast per day (midday approx)
    const daily = [];
    const dataList = response.data.list;

    const grouped = {};
    dataList.forEach((item) => {
      const date = item.dt_txt.split(" ")[0]; // e.g. "2025-09-16"
      if (item.dt_txt.includes("12:00:00") && !grouped[date]) {
        grouped[date] = {
          date,
          temperature: item.main.temp,
          description: item.weather[0].description,
          humidity: item.main.humidity,
          wind: item.wind.speed,
        };
      }
    });

    Object.values(grouped).forEach((d) => daily.push(d));

    res.json({
      city: response.data.city.name,
      forecast: daily.slice(0, 5), // limit to 5 days
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: "City not found" });
    } else if (error.response && error.response.status === 401) {
      res.status(401).json({ error: "Invalid API key" });
    } else {
      res.status(500).json({ error: "Failed to fetch weather forecast" });
    }
  }
});

module.exports = router;
