require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mongoose Serverless Connection Cache
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }
  const db = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = db.connections[0].readyState === 1;
};

// Mongoose Models
const StatSchema = new mongoose.Schema({
  metric: String,
  value: Number,
  chartUrl: String,
  date: { type: Date, default: Date.now },
});
const Stat = mongoose.models.Stat || mongoose.model("Stat", StatSchema);

// API Routes
app.get("/api/stats", async (req, res) => {
  try {
    await connectToDatabase();
    const stats = await Stat.find().sort({ date: -1 }).limit(10);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats", details: error.message });
  }
});

app.post("/api/stats", async (req, res) => {
  try {
    await connectToDatabase();
    const { metric, value, chartUrl } = req.body;
    const newStat = new Stat({ metric, value, chartUrl });
    await newStat.save();
    res.status(201).json(newStat);
  } catch (error) {
    res.status(500).json({ error: "Failed to save stat", details: error.message });
  }
});

module.exports = app;
