// server/routes/restaurant.routes.js
const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant.model");

// GET all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    console.error("Get restaurants error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADD a restaurant (admin from frontend)
router.post("/", async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    const saved = await restaurant.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Add restaurant error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE a restaurant
router.put("/:id", async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Restaurant not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update restaurant error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE a restaurant
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Restaurant not found" });
    res.json({ success: true, message: "Restaurant deleted" });
  } catch (err) {
    console.error("Delete restaurant error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADD review to restaurant (user only)
router.post("/:id/reviews", async (req, res) => {
  try {
    const { username, rating, comment } = req.body;
    if (!username || rating == null || !comment) {
      return res.status(400).json({ success: false, message: "username, rating and comment required" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

    const newReview = {
      username,
      rating: Number(rating),
      comment,
      date: new Date()
    };

    restaurant.reviews.push(newReview);
    await restaurant.save();

    res.status(201).json({ success: true, message: "Review added", reviews: restaurant.reviews });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE review by id
router.delete("/:id/reviews/:reviewId", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

    restaurant.reviews = restaurant.reviews.filter(r => r._id.toString() !== req.params.reviewId);
    await restaurant.save();

    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
