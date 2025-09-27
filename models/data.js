// models/Data.js
const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sensorReadings: Object, // { temp: 22, humidity: 40, etc. }
  imageUrl: String,       // saved image path or cloud link
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Data", dataSchema);
