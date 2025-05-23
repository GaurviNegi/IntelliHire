const express = require("express");
const router = express.Router();
const User = require("../models/user");
const MCQResult = require("../models/MCQResult");
const CodingResult = require("../models/CodingResult");
const authMiddleware = require("../middleware/authMiddleware"); 




//! check the test attempted status 
router.get("/test-status", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; 
    console.log(userId)// Get user ID from token/session
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ testAttempted: user.testAttempted });
  } catch (error) {
    console.error("Error fetching test status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
















//! submit test 
router.post("/submit-test", authMiddleware , async (req, res) => {
  try {
    const {answers , violation } = req.body;
    const userId = req.user.userId;
    console.log(answers , violation);

    // Calculate MCQ Score
    const totalMCQScore = answers.filter(ans => ans.isCorrect).length;

    // Save MCQ Result
    await MCQResult.create({ userId, answers, totalMCQScore });

    // Get Coding Score
    const codingResult = await CodingResult.findOne({ userId });
    const totalCodingScore = codingResult
      ? codingResult.submissions.reduce((sum, sub) => sum + sub.codingScore, 0)
      : 0;
    

    // Calculate final score
    const finalScore =  totalMCQScore + totalCodingScore;

    // Update User Score
      await User.findByIdAndUpdate(
      userId,
      { testAttempted: true, score: finalScore , violation },
      { new: true }
    );

    res.status(201).json({message: "Test submitted successfully"});

  } catch (error) {
    res.status(500).json({ message: "Something went wrong!", error });
  }
});

module.exports = router;

