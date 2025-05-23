const express = require('express');
const mongoose = require('mongoose'); 
const axios = require('axios');
const dotenv = require('dotenv');
const CodingResult = require("../models/CodingResult");
const authMiddleware = require('../middleware/authMiddleware');



dotenv.config();
const router = express.Router();

const JUDGE0_API_URL = "https://judge029.p.rapidapi.com";
const JUDGE0_API_KEY = "99814c9b11msh2b796f27f5adff3p1aa1bdjsn6e1aa5cdbd4a"; // Hardcoded API Key

// Function to encode Base64 correctly
const encodeBase64 = (str) => Buffer.from(str, 'utf-8').toString('base64');
// Function to decode Base64 correctly
const decodeBase64 = (str) => Buffer.from(str, 'base64').toString('utf-8');

//! Code Execution Route
router.post('/run',authMiddleware,  async (req, res) => {
    try {
        const { language_id, source_code, testCases } = req.body;
        let results = [];

        for (let testCase of testCases) {
            // Make submission request
            const { data: submissionResponse } = await axios.post(
                `${JUDGE0_API_URL}/submissions`,
                {
                    source_code: encodeBase64(source_code),
                    language_id,
                    stdin: encodeBase64(testCase.input),
                    expected_output: encodeBase64(testCase.output)
                },
                {
                    params: { base64_encoded: "true", wait: "true", fields: "*" }, // Wait for execution
                    headers: {
                        'x-rapidapi-key': JUDGE0_API_KEY, // Hardcoded API Key
                        'x-rapidapi-host': 'judge029.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    }
                }
            );

            results.push({
              input: testCase.input,
              expectedOutput: testCase.output,
              actualOutput: submissionResponse.stdout ? decodeBase64(submissionResponse.stdout) : "Error",
              status: submissionResponse.status.description,
              executionTime: submissionResponse.time || "N/A"
            });
        }
        console.log(results); 
        res.status(200).json(results);
    } catch (error) {
        console.error("Error in code execution:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});












router.post("/submit-code", authMiddleware ,async (req, res) => {
  try {
    const userId = req.user.userId; 
    const {questionId, code, language, testCases } = req.body;
    console.log(userId);
    console.log(questionId); 
    console.log(code); 
    console.log(language); 
    console.log(testCases); 


    if (!userId || !questionId || !code || !language || !testCases) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure userId is an ObjectId if using MongoDB
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;

    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Calculate score
    let passedTestCases = testCases.filter(tc => tc.status === "Accepted").length;
    let multiplier = testCases.every(tc => tc.execution_time < 5) ? 2 : 1;
    let codingScore = passedTestCases * 10 * multiplier;

    // Find user's previous submissions
    let userCodingResult = await CodingResult.findOne({ userId: userObjectId });

    if (!userCodingResult) {
      // If no previous record, create a new one
      userCodingResult = new CodingResult({
        userId: userObjectId,
        submissions: [{ questionId, code, language, testCases, codingScore }]
      });
    } else {
      // Check if user has already submitted for this question
      let submissionIndex = userCodingResult.submissions.findIndex(sub => sub.questionId.toString() === questionId);

      if (submissionIndex !== -1) {
        // Overwrite previous submission
        userCodingResult.submissions[submissionIndex] = {
          questionId,
          code,
          language,
          testCases,
          codingScore
        };
      } else {
        // Add new submission
        userCodingResult.submissions.push({
          questionId,
          code,
          language,
          testCases,
          codingScore
        });
      }
    }

    // Save result
    await userCodingResult.save();

    return res.status(200).json({ message: "Solution submitted successfully", codingScore });
  } catch (error) {
    console.error("Error submitting coding solution:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router

