// server/models/restaurant.model.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  username: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  cuisine: { type: String, default: "" },
  image: { type: String, default: "" },
  reviews: [{
    username: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
