// server/routes/review.routes.js
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");

// ✅ Add review to restaurant
router.post("/", async (req, res) => {
  try {
    const { restaurantId, user, rating, comment } = req.body;

    if (!restaurantId || !user || !rating || !comment) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const review = new Review({ restaurantId, user, rating, comment });
    await review.save();

    // also push review reference to restaurant
    await Restaurant.findByIdAndUpdate(restaurantId, { $push: { reviews: review._id } });

    res.status(201).json({ success: true, message: "Review added successfully", review });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
