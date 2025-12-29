// server/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.model"); // ensure exists

// register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ success:false, message:"fields required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success:false, message:"User exists" });
    const hash = await bcrypt.hash(password, 10);
    const u = new User({ username, email, password: hash, role: role || "user" });
    await u.save();
    res.status(201).json({ success:true, message: "Registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return res.status(400).json({ success:false, message:"Invalid credentials" });
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.status(400).json({ success:false, message:"Invalid credentials" });

    // return user info (no token in this dummy auth)
    res.json({ success:true, message:"Login successful", user: { id: u._id, username: u.username, email: u.email, role: u.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
});

module.exports = router;
