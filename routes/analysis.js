// backend/routes/analysis.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");
const { verifyToken } = require("../middleware/auth");
const fs = require("fs");

// ---------- MULTER CONFIG ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ---------- ANALYZE IMAGE ----------
router.post(
  "/analyze",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const imagePath = req.file.path;

      const pythonProcess = spawn("python", [
        path.join(__dirname, "../ml_model_api/app.py"),
        imagePath,
      ]);

      let result = "";
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data) => (result += data.toString()));
      pythonProcess.stderr.on("data", (data) => (errorOutput += data.toString()));

      pythonProcess.on("close", (code) => {
        console.log("Python stdout:", result);
        console.log("Python stderr:", errorOutput);

        if (code !== 0) {
          return res
            .status(500)
            .json({ message: "ML model execution failed", error: errorOutput });
        }

        try {
          const output = JSON.parse(result.trim());
          if (output.error)
            return res.status(500).json({ message: output.error });

          // 🔹 Map Python's fertilizer_status → status (for frontend)
          res.json({
            ...output,
            status: output.fertilizer_status, // 👈 added
            imagePath,
          });
        } catch (e) {
          console.error("Failed to parse Python output:", e);
          console.error("Raw output:", result);
          res
            .status(500)
            .json({ message: "Failed to parse ML output", error: result });
        }
      });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
