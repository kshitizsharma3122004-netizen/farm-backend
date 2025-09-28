const express = require("express");
const router = express.Router();

// Static list of cities
const CITY_LIST = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Kolkata",
  "Chennai",
  "Pune",
  "Hyderabad",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Gurgaon",
  "Surat",
  "Indore",
  "Nagpur",
  "Patna",
  "Bhubaneswar"
];

router.get("/", (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  const matches = CITY_LIST.filter(city =>
    city.toLowerCase().startsWith(query.toLowerCase())
  );

  res.json(matches);
});

module.exports = router;
