// routes/adminRoutes.js
const express = require('express');
const Admin = require('../../backend/models/Admin');
const jwt = require('jsonwebtoken');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');
const User = require("../models/user"); 
const McqResults = require("../models/MCQResult"); 
const CodingResults = require("../models/CodingResult"); 
const Question = require("../models/Question");

const router = express.Router();

// @route   POST /api/admin/create
// @desc    Create a new admin
// @access  Private (only for existing admins)
router.post('/create',  async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({
      name,
      email,
      password,
    });

    // Save admin
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// @route   POST /api/admin/login
// @desc    Authenticate admin and get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const admin = await Admin.findOne({ email });
  
      if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
      }
  
      // Check password
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ 
         id: admin._id,
        name: admin.name,
        email: admin.email,}, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expiration (you can change this)
      });
  
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });













  //? for the users 
  // routes/adminRoutes.js
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (only for admins)
router.get('/users', protectAdmin, async (req, res) => {
    try {
      const users = await User.find(); // Replace with your User model
      const mappedUsers = users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        testAttempted: user.testAttempted,
        score: user.score,
        tabViolation: user.tabViolation,
        __v: user.__v
      }));

      res.json(mappedUsers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });



  // @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (only for admins)
router.post('/users', protectAdmin, async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const userExists = await User.findOne({ email });
  
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const user = new User({ name, email, password });
      await user.save();
      res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  

  // @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (only for admins)
router.put('/users/:id', protectAdmin, async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.name = name || user.name;
      user.email = email || user.email;
      user.password = password || user.password;
  
      await user.save();
      res.json({ message: 'User updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  



// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (only for admins)
router.delete('/users/:id', protectAdmin, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      await User.findByIdAndDelete(user._id);
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  



















  //? for the questions 
  // @route   GET /api/admin/questions
// @desc    Get all questions
// @access  Private (only for admins)
router.get('/questions', protectAdmin, async (req, res) => {
    try {
      const questions = await Question.find(); 
      res.json(questions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });


  // @route   POST /api/admin/questions
// @desc    Add a new question
// @access  Private (only for admins)
router.post('/questions', protectAdmin, async (req, res) => {
    const { type, title, description, options, correctAnswer, testCases } = req.body;
  
    try {
      const question = new Question({
        type,
        title,
        description,
        options,
        correctAnswer,
        testCases,
      });
  
      await question.save();
      res.status(201).json({ message: 'Question added successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  

  // @route   PUT /api/admin/questions/:id
// @desc    Update a question
// @access  Private (only for admins)
router.put('/questions/:id', protectAdmin, async (req, res) => {
    const { type, title, description, options, correctAnswer, testCases } = req.body;
  
    try {
      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      question.type = type || question.type;
      question.title = title || question.title;
      question.description = description || question.description;
      question.options = options || question.options;
      question.correctAnswer = correctAnswer || question.correctAnswer;
      question.testCases = testCases || question.testCases;
  
      await question.save();
      res.json({ message: 'Question updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// @route   DELETE /api/admin/questions/:id
// @desc    Delete a question
// @access  Private (only for admins)
router.delete('/questions/:id', protectAdmin, async (req, res) => {
    try {
      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      await Question.deleteOne(question);
      res.json({ message: 'Question deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });











//?for result 

// @route   GET /api/admin/results
// @desc    Get all results grouped by user
// @access  Private (only for admins)


// API 1: List all users' MCQ + Coding + Total Scores
router.get('/results', protectAdmin, async (req, res) => {
  try {
    const users = await User.find();
    const mcqResults = await McqResults.find();
    const codingResults = await CodingResults.find();
    
    const resultData = users.map(user => {
      const userMcqResult = mcqResults.find(mr => mr.userId.toString() === user._id.toString());
      const userCodingResult = codingResults.find(cr => cr.userId.toString() === user._id.toString());

      
      const totalMcqScore = userMcqResult ? userMcqResult.totalMCQScore : 0;
      const totalCodingScore = userCodingResult ? userCodingResult.submissions.reduce((sum, sub) => sum + sub.codingScore, 0): 0;
      const totalScore = user.score; 

      return { 
        userId: user._id,
        name: user.name,
        email: user.email,
        totalCodingScore,
        totalMcqScore,
        totalScore
      };
    });
    
    res.json(resultData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/results/:userId', protectAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userMcqResult = await McqResults.findOne({ userId }).populate('answers.questionId' , 'title options correctAnswer' );
    const userCodingResult = await CodingResults.findOne({ userId }).populate('submissions.questionId' , 'title description');

    console.log(" coding result " + userCodingResult)
    console.log(" mcq result " + userMcqResult); 
    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      mcqResult: userMcqResult || null,
      codingResult: userCodingResult || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

 
  

    
module.exports = router;
