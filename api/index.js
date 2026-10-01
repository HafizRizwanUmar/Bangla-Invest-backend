require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } = require("firebase/firestore");

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5-5pJ8suSfAibj-i7eBwtyH4XP7VoncM",
  authDomain: "minderfly.firebaseapp.com",
  projectId: "minderfly",
  storageBucket: "minderfly.firebasestorage.app",
  messagingSenderId: "479127672490",
  appId: "1:479127672490:web:97ec30fd22460e9fdaa2d3",
  measurementId: "G-2D6WXFYWT2"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// API Routes
app.get("/api/stats", async (req, res) => {
  try {
    const statsRef = collection(db, "stats");
    const q = query(statsRef, orderBy("date", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    
    const stats = [];
    querySnapshot.forEach((doc) => {
      stats.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats", details: error.message });
  }
});

app.post("/api/stats", async (req, res) => {
  try {
    const { metric, value, chartUrl } = req.body;
    
    const statsRef = collection(db, "stats");
    const newStat = {
      metric,
      value,
      chartUrl,
      date: new Date().toISOString()
    };
    
    const docRef = await addDoc(statsRef, newStat);
    res.status(201).json({ id: docRef.id, ...newStat });
  } catch (error) {
    res.status(500).json({ error: "Failed to save stat", details: error.message });
  }
});

module.exports = app;
