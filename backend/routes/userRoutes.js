const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();


//  REGISTER USER
router.post("/register", async (req, res) => {
  console.log("Request Body:", req.body); // Debugging line

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
  }
  
  try {
      let user = await User.findOne({ email });
      if (user) {
          return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({ name, email, password: hashedPassword });
      await user.save();

      res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
      console.error("Registration Error:", err); // Print error to console
      res.status(500).json({ message: "Server error" });
  }
});



//! login route = ====  === === 
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    
    // Store token in HTTP-Only Cookie
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });

    console.log(token) ; 

    // Send user details in response
    res.json({ name: user.name, email: user.email});

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});




//!logout route 
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
  res.status(200).json({ message: "Logged out successfully" });
});


module.exports = router;
