const express = require("express");
const multer = require("multer");
const path = require("path");
const Data = require("../models/data");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Ensure absolute path for uploads
const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

router.post("/upload", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const newData = new Data({
      userId: req.user.id,
      sensorReadings: req.body.sensorReadings,
      imageUrl: req.file.path
    });
    await newData.save();
    res.json({ message: "Data uploaded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
