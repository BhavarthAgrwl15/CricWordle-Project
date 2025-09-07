const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// JWT secret key (better keep in .env)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password, isAdmin } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // password policy: at least 6 chars and at least one digit
    const passwordPolicy = /^(?=.*\d).{6,}$/;
    if (!passwordPolicy.test(password)) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters long and contain at least one number",
      });
    }

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    // if trying to register as admin, ensure only one admin allowed
    let finalIsAdmin = false;
    if (isAdmin === true) {
      const existingAdmin = await User.findOne({ isAdmin: true });
      if (existingAdmin) {
        return res.status(400).json({ msg: "An admin already exists. Only one admin allowed." });
      }
      finalIsAdmin = true;
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new User({ 
      name, 
      username, 
      email, 
      passwordHash, 
      isAdmin: finalIsAdmin 
    });
    await newUser.save();

    res.status(201).json({ 
      msg: "User registered successfully", 
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // check user exists (by email OR username)
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // create JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,   // ✅ include isAdmin
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
