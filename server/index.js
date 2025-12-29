require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const restaurantRoutes = require("./routes/restaurant.routes");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/restodb";

mongoose.connect(MONGO)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err));

// ✅ IMPORTANT: make sure these lines come AFTER requiring routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
